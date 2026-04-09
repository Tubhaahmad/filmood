/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import MoodPanel from "@/components/dashboard/MoodPanel";
import { allMoods } from "@/lib/moodMap";

// ── Module mocks ───────────────────────────────────────────────────────────
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────
const defaultProps = {
  isOpen: true,
  embedded: true, // skip animation wrapper for simpler assertions
  selectedMoods: new Set<string>(),
  onSelectMood: vi.fn(),
  onClose: vi.fn(),
};

describe("MoodPanel", () => {
  afterEach(() => vi.clearAllMocks());

  // ── Mood grid rendering ───────────────────────────────────────────────────
  it(`renders all ${allMoods.length} mood cards`, () => {
    render(<MoodPanel {...defaultProps} />);
    // Each mood renders a button; plus Refine/Close buttons — just assert mood labels appear
    for (const mood of allMoods) {
      expect(screen.getByText(mood.label)).toBeInTheDocument();
    }
  });

  it("renders each mood's tag label", () => {
    render(<MoodPanel {...defaultProps} />);
    for (const mood of allMoods) {
      expect(screen.getByText(mood.tagLabel)).toBeInTheDocument();
    }
  });

  // ── Selection callbacks ───────────────────────────────────────────────────
  it("calls onSelectMood with the moodKey when a mood card is clicked", () => {
    render(<MoodPanel {...defaultProps} />);
    // Click the first mood in the grid
    const firstMood = allMoods[0];
    // Each MoodCard renders a <button>; find by the mood label text
    fireEvent.click(screen.getByText(firstMood.label).closest("button")!);
    expect(defaultProps.onSelectMood).toHaveBeenCalledWith(firstMood.key);
  });

  it("calls onSelectMood again when clicking a selected mood (parent handles deselect)", () => {
    const firstMood = allMoods[0];
    render(
      <MoodPanel {...defaultProps} selectedMoods={new Set([firstMood.key])} />,
    );
    fireEvent.click(screen.getByText(firstMood.label).closest("button")!);
    expect(defaultProps.onSelectMood).toHaveBeenCalledWith(firstMood.key);
  });

  // ── "Find films" button visibility ───────────────────────────────────────
  it('does NOT render "Find films" button when no moods are selected', () => {
    render(<MoodPanel {...defaultProps} selectedMoods={new Set()} />);
    // Use role query to avoid matching the hint text "Select your moods, then find films"
    expect(
      screen.queryByRole("button", { name: /find films/i }),
    ).not.toBeInTheDocument();
  });

  it('renders "Find films" button when at least one mood is selected', () => {
    render(<MoodPanel {...defaultProps} selectedMoods={new Set(["laugh"])} />);
    expect(screen.getByText(/find films/i)).toBeInTheDocument();
  });

  // ── "Find films" navigation ───────────────────────────────────────────────
  it('calls router.push with /results?mood=... when "Find films" is clicked', () => {
    render(<MoodPanel {...defaultProps} selectedMoods={new Set(["laugh"])} />);
    fireEvent.click(screen.getByText(/find films/i));
    expect(mockPush).toHaveBeenCalledOnce();
    const [url] = mockPush.mock.calls[0];
    expect(url).toMatch(/^\/results\?/);
    expect(url).toContain("mood=laugh");
  });

  it("includes all selected moods in the router push URL", () => {
    render(
      <MoodPanel
        {...defaultProps}
        selectedMoods={new Set(["laugh", "thrilling", "escape"])}
      />,
    );
    fireEvent.click(screen.getByText(/find films/i));
    const [url] = mockPush.mock.calls[0];
    expect(url).toContain("laugh");
    expect(url).toContain("thrilling");
    expect(url).toContain("escape");
  });

  // ── Selection count label ─────────────────────────────────────────────────
  it('shows "Select your moods" hint when nothing is selected', () => {
    render(<MoodPanel {...defaultProps} selectedMoods={new Set()} />);
    expect(screen.getByText(/select your moods/i)).toBeInTheDocument();
  });

  it("shows selection count label when moods are selected", () => {
    render(
      <MoodPanel
        {...defaultProps}
        selectedMoods={new Set(["laugh", "escape"])}
      />,
    );
    expect(screen.getByText(/2 moods selected/i)).toBeInTheDocument();
  });

  // ── Close button ──────────────────────────────────────────────────────────
  it("calls onClose when the Close button is clicked", () => {
    render(<MoodPanel {...defaultProps} />);
    fireEvent.click(screen.getByText(/^close$/i));
    expect(defaultProps.onClose).toHaveBeenCalledOnce();
  });

  // ── Refinement panel visibility ───────────────────────────────────────────
  it('shows the "Refine results" button', () => {
    render(<MoodPanel {...defaultProps} />);
    expect(screen.getByText(/refine results/i)).toBeInTheDocument();
  });

  it('expands the refinement section when "Refine results" is clicked', () => {
    render(<MoodPanel {...defaultProps} />);
    fireEvent.click(screen.getByText(/refine results/i));
    // Refinement options appear
    expect(screen.getByText(/how long do you have/i)).toBeInTheDocument();
    expect(screen.getByText(/subtitles okay/i)).toBeInTheDocument();
  });

  // ── Animation wrapper (non-embedded) ─────────────────────────────────────
  it("collapses via maxHeight when isOpen=false and not embedded", () => {
    const { container } = render(
      <MoodPanel {...defaultProps} embedded={false} isOpen={false} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.maxHeight).toBe("0");
  });
});

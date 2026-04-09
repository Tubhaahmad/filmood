/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchPanel from "@/components/dashboard/SearchPanel";
import type { Film } from "@/lib/types";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// ── Test films ─────────────────────────────────────────────────────────────
function makeFilm(id: number, title: string): Film {
  return {
    id,
    title,
    poster_path: null,
    release_date: "2023-01-01",
    vote_average: 7.0,
    overview: `Overview of ${title}`,
  };
}

// 19 films — first 18 are shown, 19th (ExtraFilm) should be capped out
const FILMS: Film[] = Array.from(
  { length: 18 },
  (_, i) => makeFilm(i + 1, `Film ${String.fromCharCode(65 + i)}`), // Film A … Film R
);
const FILMS_PLUS_ONE = [...FILMS, makeFilm(19, "CappedFilm")];

const defaultProps = {
  isOpen: true,
  embedded: true, // skip animation wrapper for simpler DOM assertions
  films: FILMS_PLUS_ONE,
  activeCategory: null as string | null,
  activeGenre: null as number | null,
  onCategoryChange: vi.fn(),
  onClose: vi.fn(),
};

describe("SearchPanel", () => {
  afterEach(() => vi.clearAllMocks());

  // ── Static structure ─────────────────────────────────────────────────────
  it('renders the "Browse" section label', () => {
    render(<SearchPanel {...defaultProps} />);
    expect(screen.getByText(/browse/i)).toBeInTheDocument();
  });

  it("renders all 6 category tab buttons", () => {
    render(<SearchPanel {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /trending/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /top rated/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /new releases/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /in cinemas/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /by genre/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /streaming in norway/i }),
    ).toBeInTheDocument();
  });

  it('renders the "Full search" link pointing to /browse', () => {
    render(<SearchPanel {...defaultProps} />);
    // The link text is "Full search" and href defaults to /browse (no active filters)
    const link = screen.getByRole("link", { name: /full search/i });
    expect(link).toHaveAttribute("href", "/browse");
  });

  it("renders the Close button", () => {
    render(<SearchPanel {...defaultProps} />);
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  // ── Film count cap ────────────────────────────────────────────────────────
  it("caps displayed films at 18 even when more are passed", () => {
    render(<SearchPanel {...defaultProps} />);
    // Film 19 "CappedFilm" should NOT appear (capped at 18)
    expect(screen.queryByText("CappedFilm")).not.toBeInTheDocument();
    // Film A (first film) should appear
    expect(screen.getByText("Film A")).toBeInTheDocument();
  });

  it("shows correct film count in footer (X of Y)", () => {
    render(<SearchPanel {...defaultProps} />);
    // 18 shown out of 19 total
    const strongs = document.querySelectorAll("strong");
    const values = Array.from(strongs).map((s) => s.textContent);
    expect(values).toContain("18");
    expect(values).toContain("19");
  });

  // ── Search filtering ──────────────────────────────────────────────────────
  it("filters film list as the user types in the search input", async () => {
    const user = userEvent.setup();
    // Use a small set so we can assert absence clearly
    render(
      <SearchPanel
        {...defaultProps}
        films={[
          makeFilm(1, "Inception"),
          makeFilm(2, "Interstellar"),
          makeFilm(3, "Dunkirk"),
        ]}
      />,
    );

    const input = screen.getByPlaceholderText(/filter results/i);
    await user.type(input, "Inter");

    // Only "Interstellar" contains "Inter"
    expect(screen.getByText("Interstellar")).toBeInTheDocument();
    expect(screen.queryByText("Inception")).not.toBeInTheDocument();
    expect(screen.queryByText("Dunkirk")).not.toBeInTheDocument();
  });

  it("shows empty state message when no films match the query", async () => {
    const user = userEvent.setup();
    render(<SearchPanel {...defaultProps} />);

    const input = screen.getByPlaceholderText(/filter results/i);
    await user.type(input, "xyzxyzxyz");

    // The empty state renders when displayFilms.length === 0
    expect(screen.getByText(/no films matching/i)).toBeInTheDocument();
  });

  it("shows all matched films in footer text when query matches all", async () => {
    render(
      <SearchPanel {...defaultProps} films={[makeFilm(1, "Inception")]} />,
    );
    // 1 film, <= 12 cap → "Showing 1 film"
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  // ── Category tabs ─────────────────────────────────────────────────────────
  it("calls onCategoryChange with correct id when a tab is clicked", () => {
    render(<SearchPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /top rated/i }));
    expect(defaultProps.onCategoryChange).toHaveBeenCalledWith("top-rated");
  });

  it("calls onCategoryChange('trending') when Trending tab is clicked", () => {
    render(<SearchPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /^trending$/i }));
    expect(defaultProps.onCategoryChange).toHaveBeenCalledWith("trending");
  });

  // ── Genre chips ───────────────────────────────────────────────────────────
  it("does NOT render genre chips when activeCategory is not 'by-genre'", () => {
    render(<SearchPanel {...defaultProps} activeCategory="trending" />);
    expect(screen.queryByText("Action")).not.toBeInTheDocument();
    expect(screen.queryByText("Comedy")).not.toBeInTheDocument();
  });

  it("renders genre chips when activeCategory is 'by-genre'", () => {
    render(<SearchPanel {...defaultProps} activeCategory="by-genre" />);
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Comedy")).toBeInTheDocument();
    expect(screen.getByText("Drama")).toBeInTheDocument();
  });

  it("calls onCategoryChange('by-genre', genreId) when a genre chip is clicked", () => {
    render(<SearchPanel {...defaultProps} activeCategory="by-genre" />);
    fireEvent.click(screen.getByRole("button", { name: "Action" }));
    expect(defaultProps.onCategoryChange).toHaveBeenCalledWith("by-genre", 28);
  });

  // ── Close button ──────────────────────────────────────────────────────────
  it("calls onClose when the Close button is clicked", () => {
    render(<SearchPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(defaultProps.onClose).toHaveBeenCalledOnce();
  });

  // ── Animation wrapper (non-embedded) ─────────────────────────────────────
  it("collapses via gridTemplateRows:0fr when isOpen=false and not embedded", () => {
    const { container } = render(
      <SearchPanel {...defaultProps} embedded={false} isOpen={false} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.gridTemplateRows).toBe("0fr");
  });

  it("expands via gridTemplateRows:1fr when isOpen=true and not embedded", () => {
    const { container } = render(
      <SearchPanel {...defaultProps} embedded={false} isOpen />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.gridTemplateRows).toBe("1fr");
  });
});

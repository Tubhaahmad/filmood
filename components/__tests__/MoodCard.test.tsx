/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import MoodCard from "@/components/dashboard/MoodCard";

const defaultProps = {
  moodKey: "laugh",
  tagLabel: "Need to laugh",
  label: "Laugh until it hurts",
  description: "Comedy, feel-good, absurd",
  accentColor: "gold" as const,
  isSelected: false,
  onSelect: vi.fn(),
};

describe("MoodCard", () => {
  afterEach(() => vi.clearAllMocks());

  it("renders tagLabel, label and description", () => {
    render(<MoodCard {...defaultProps} />);
    expect(screen.getByText("Need to laugh")).toBeInTheDocument();
    expect(screen.getByText("Laugh until it hurts")).toBeInTheDocument();
    expect(screen.getByText("Comedy, feel-good, absurd")).toBeInTheDocument();
  });

  it("calls onSelect with the moodKey when clicked", () => {
    render(<MoodCard {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onSelect).toHaveBeenCalledOnce();
    expect(defaultProps.onSelect).toHaveBeenCalledWith("laugh");
  });

  it("still calls onSelect when already selected (deselect handled by parent)", () => {
    render(<MoodCard {...defaultProps} isSelected />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onSelect).toHaveBeenCalledWith("laugh");
  });

  it("renders each supported accent color without throwing", () => {
    const colors = ["gold", "blue", "rose", "violet", "teal", "ember"] as const;
    for (const accentColor of colors) {
      const { unmount } = render(
        <MoodCard {...defaultProps} accentColor={accentColor} />,
      );
      expect(screen.getByRole("button")).toBeInTheDocument();
      unmount();
    }
  });
});

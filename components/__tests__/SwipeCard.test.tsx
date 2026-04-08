/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import SwipeCard from "@/components/group/SwipeCard";
import type { DeckFilm } from "@/lib/types";

// ── Module mocks ───────────────────────────────────────────────────────────
vi.mock("@/lib/useMediaQuery", () => ({
  useMediaQuery: vi.fn(() => false),
}));

// Real moodMap and genreMap work fine in node/jsdom — no need to mock them.

// ── Shared test data ───────────────────────────────────────────────────────
const mockFilm: DeckFilm = {
  id: 1,
  title: "Inception",
  overview: "A thief who enters the architecture of dreams.",
  poster_path: null, // avoids background-image fetch issues in jsdom
  release_date: "2010-07-16",
  vote_average: 8.8,
  genre_ids: [28, 878], // Action + Sci-Fi
  mood_keys: ["thrilling"],
};

const baseProps = {
  film: mockFilm,
  index: 0,
  total: 5,
  exitDirection: null as "left" | "right" | "up" | null,
  dragOffset: { x: 0, y: 0 },
  isDragging: false,
  onPointerDown: vi.fn(),
  onPointerMove: vi.fn(),
  onPointerUp: vi.fn(),
};

describe("SwipeCard", () => {
  afterEach(() => vi.clearAllMocks());

  it("renders the film title", () => {
    render(<SwipeCard {...baseProps} />);
    expect(screen.getByText("Inception")).toBeInTheDocument();
  });

  it("renders the release year", () => {
    render(<SwipeCard {...baseProps} />);
    expect(screen.getByText("2010")).toBeInTheDocument();
  });

  it("renders the rating", () => {
    render(<SwipeCard {...baseProps} />);
    expect(screen.getByText("8.8")).toBeInTheDocument();
  });

  it("renders the card counter (index + 1 / total)", () => {
    render(<SwipeCard {...baseProps} index={2} total={10} />);
    expect(screen.getByText("3 / 10")).toBeInTheDocument();
  });

  it("renders the film overview", () => {
    render(<SwipeCard {...baseProps} />);
    expect(
      screen.getByText(/A thief who enters the architecture/),
    ).toBeInTheDocument();
  });

  it("renders mood tag pills from mood_keys", () => {
    render(<SwipeCard {...baseProps} />);
    // moodMap['thrilling'].tagLabel = 'Need a rush'
    expect(screen.getByText("Need a rush")).toBeInTheDocument();
  });

  it("calls onPointerDown when pointer is pressed on the card", () => {
    const { container } = render(<SwipeCard {...baseProps} />);
    fireEvent.pointerDown(container.firstChild as Element);
    expect(baseProps.onPointerDown).toHaveBeenCalledOnce();
  });

  it("calls onPointerMove when pointer moves over the card", () => {
    const { container } = render(<SwipeCard {...baseProps} />);
    fireEvent.pointerMove(container.firstChild as Element);
    expect(baseProps.onPointerMove).toHaveBeenCalledOnce();
  });

  it("calls onPointerUp when pointer is released", () => {
    const { container } = render(<SwipeCard {...baseProps} />);
    fireEvent.pointerUp(container.firstChild as Element);
    expect(baseProps.onPointerUp).toHaveBeenCalledOnce();
  });

  it("applies right-exit transform when exitDirection='right'", () => {
    const { container } = render(
      <SwipeCard {...baseProps} exitDirection="right" />,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.style.transform).toContain("translateX(120%)");
    expect(card.style.transform).toContain("rotate(8deg)");
  });

  it("applies left-exit transform when exitDirection='left'", () => {
    const { container } = render(
      <SwipeCard {...baseProps} exitDirection="left" />,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.style.transform).toContain("translateX(-120%)");
    expect(card.style.transform).toContain("rotate(-8deg)");
  });

  it("applies up-exit transform when exitDirection='up'", () => {
    const { container } = render(
      <SwipeCard {...baseProps} exitDirection="up" />,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.style.transform).toContain("translateY(-80%)");
  });

  it("shows 'Yes' glow label when dragging right by more than 40px", () => {
    render(
      <SwipeCard {...baseProps} isDragging dragOffset={{ x: 80, y: 0 }} />,
    );
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("shows 'Nah' glow label when dragging left by more than 40px", () => {
    render(
      <SwipeCard {...baseProps} isDragging dragOffset={{ x: -80, y: 0 }} />,
    );
    expect(screen.getByText("Nah")).toBeInTheDocument();
  });

  it("shows 'Maybe' glow label when dragging up by more than 40px", () => {
    render(
      <SwipeCard {...baseProps} isDragging dragOffset={{ x: 0, y: -80 }} />,
    );
    expect(screen.getByText("Maybe")).toBeInTheDocument();
  });
});

/*
 * NOTE — Keyboard interactions (ArrowLeft / ArrowRight / ArrowUp):
 * SwipeCard has no keyboard event handlers; it is a purely pointer-driven
 * component. Arrow-key handling lives in the session page
 * (app/group/[code]/page.tsx) via a window-level keydown listener.
 * Integration tests for that behaviour belong in a separate
 * GroupSession.test.tsx using the page component directly.
 */

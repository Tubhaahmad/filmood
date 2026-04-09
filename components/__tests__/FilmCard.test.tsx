/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import FilmCard from "@/components/film/FilmCard";

// ── Module mocks ───────────────────────────────────────────────────────────
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

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    ...rest
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...rest} />,
}));

// ── Shared props ───────────────────────────────────────────────────────────
const baseFilm = {
  id: 42,
  title: "Inception",
  posterPath: "/inception.jpg" as string | null,
  releaseDate: "2010-07-16",
  voteAverage: 8.8,
  overview: "A thief who steals corporate secrets through the dream world.",
};

describe("FilmCard", () => {
  it("renders the film title", () => {
    render(<FilmCard {...baseFilm} />);
    expect(screen.getByText("Inception")).toBeInTheDocument();
  });

  it("renders a poster image with the correct TMDB src", () => {
    render(<FilmCard {...baseFilm} />);
    const img = screen.getByAltText("Inception");
    expect(img).toHaveAttribute(
      "src",
      "https://image.tmdb.org/t/p/w500/inception.jpg",
    );
  });

  it('shows the "No Poster" fallback when posterPath is null', () => {
    render(<FilmCard {...baseFilm} posterPath={null} />);
    expect(screen.getByText("No Poster")).toBeInTheDocument();
    expect(screen.queryByAltText("Inception")).not.toBeInTheDocument();
  });

  it("renders the release year extracted from releaseDate", () => {
    render(<FilmCard {...baseFilm} />);
    expect(screen.getByText("2010")).toBeInTheDocument();
  });

  it("renders the rating badge formatted to one decimal place", () => {
    render(<FilmCard {...baseFilm} />);
    expect(screen.getByText("★ 8.8")).toBeInTheDocument();
  });

  it("links to the correct film page", () => {
    render(<FilmCard {...baseFilm} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/film/42");
  });

  it("renders the film overview text", () => {
    render(<FilmCard {...baseFilm} />);
    expect(
      screen.getByText(/A thief who steals corporate secrets/),
    ).toBeInTheDocument();
  });

  it("shows a non-breaking space when overview is empty (preserves card height)", () => {
    render(<FilmCard {...baseFilm} overview="" />);
    // The component renders \u00A0 (nbsp) for empty overview
    const p = document.querySelector("p:last-of-type");
    expect(p).toBeInTheDocument();
  });
});

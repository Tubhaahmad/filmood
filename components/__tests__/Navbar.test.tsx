/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import type { User } from "@supabase/supabase-js";

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

// Mock useAuth — we'll override per test using mockReturnValue
const mockSignOut = vi.fn();
const mockUseAuth = vi.fn(() => ({
  user: null as User | null,
  session: null,
  loading: false,
  signOut: mockSignOut,
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

afterEach(() => vi.clearAllMocks());

describe("Navbar — guest (no user)", () => {
  it('renders "Log in" link', () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
  });

  it('"Log in" links to /login', () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it('renders "Sign up" link', () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });

  it('"Sign up" links to /signup', () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("does NOT render the profile avatar or Sign out button", () => {
    render(<Navbar />);
    expect(
      screen.queryByRole("button", { name: /sign out/i }),
    ).not.toBeInTheDocument();
  });
});

describe("Navbar — logged in user", () => {
  const fakeUser = {
    id: "user-1",
    email: "alice@example.com",
  } as User;

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: fakeUser,
      session: null,
      loading: false,
      signOut: mockSignOut,
    });
  });

  it("renders the user avatar with the first letter of their email", () => {
    render(<Navbar />);
    // first letter of "alice@example.com" is "A"
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("links the avatar to /profile", () => {
    render(<Navbar />);
    const profileLink = screen
      .getAllByRole("link")
      .find((l) => l.getAttribute("href") === "/profile");
    expect(profileLink).toBeDefined();
  });

  it('renders the "Sign out" button', () => {
    render(<Navbar />);
    expect(
      screen.getByRole("button", { name: /sign out/i }),
    ).toBeInTheDocument();
  });

  it("calls signOut when the Sign out button is clicked", () => {
    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it("does NOT render Log in or Sign up links", () => {
    render(<Navbar />);
    expect(
      screen.queryByRole("link", { name: /log in/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /sign up/i }),
    ).not.toBeInTheDocument();
  });
});

describe("Navbar — loading state", () => {
  it("renders neither auth links nor user avatar while loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: true,
      signOut: vi.fn(),
    });
    render(<Navbar />);
    expect(
      screen.queryByRole("link", { name: /log in/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /sign out/i }),
    ).not.toBeInTheDocument();
  });
});

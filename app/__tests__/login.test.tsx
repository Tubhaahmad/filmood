/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";

// ── Module mocks ───────────────────────────────────────────────────────────
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
}));

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

// Auth: not logged in by default
vi.mock("@/components/AuthProvider", () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    session: null,
    signOut: vi.fn(),
  })),
}));

// Supabase mock — auth methods
const mockSignIn = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignIn(...args),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

// ── Helpers ────────────────────────────────────────────────────────────────
async function fillLoginForm(
  email = "user@example.com",
  password = "secret123",
) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/email address/i), email);
  // Anchor the regex — the redesigned page has a "Show password" toggle
  // button whose aria-label also matches /password/i.
  await user.type(screen.getByLabelText(/^password$/i), password);
}

beforeEach(() => {
  mockSignIn.mockResolvedValue({ error: null });
  // Reset fetch stub for backdrop carousel (setup.ts sets a default)
  (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    json: async () => ({ results: [] }),
  } as unknown as Response);
});

afterEach(() => vi.clearAllMocks());

describe("LoginPage", () => {
  // ── Rendering ─────────────────────────────────────────────────────────
  it("renders the email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it("renders the submit button with initial text", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /^log in$/i }),
    ).toBeInTheDocument();
  });

  // ── Validation errors ─────────────────────────────────────────────────
  it("shows email required error when email is empty on submit", async () => {
    render(<LoginPage />);
    fireEvent.submit(
      screen.getByRole("button", { name: /log in/i }).closest("form")!,
    );
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it("shows invalid email error for a bad email format", async () => {
    render(<LoginPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email address/i), "not-an-email");
    fireEvent.submit(
      screen.getByRole("button", { name: /log in/i }).closest("form")!,
    );
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it("shows password required error when password is empty on submit", async () => {
    render(<LoginPage />);
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText(/email address/i),
      "user@example.com",
    );
    fireEvent.submit(
      screen.getByRole("button", { name: /log in/i }).closest("form")!,
    );
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  // ── Supabase interaction ──────────────────────────────────────────────
  it("calls supabase.auth.signInWithPassword with correct credentials", async () => {
    render(<LoginPage />);
    await fillLoginForm("alice@test.com", "mypass123");
    fireEvent.submit(
      screen.getByRole("button", { name: /log in/i }).closest("form")!,
    );
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "alice@test.com",
        password: "mypass123",
      });
    });
  });

  it("navigates to / on successful login", async () => {
    render(<LoginPage />);
    await fillLoginForm();
    fireEvent.submit(
      screen.getByRole("button", { name: /log in/i }).closest("form")!,
    );
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows the Supabase error message when login fails", async () => {
    mockSignIn.mockResolvedValueOnce({
      error: { message: "Invalid login credentials" },
    });
    render(<LoginPage />);
    await fillLoginForm();
    fireEvent.submit(
      screen.getByRole("button", { name: /log in/i }).closest("form")!,
    );
    await waitFor(() => {
      expect(screen.getByText("Invalid login credentials")).toBeInTheDocument();
    });
  });

  // ── Loading state ─────────────────────────────────────────────────────
  it('shows "Logging in..." and disables the button while request is in-flight', async () => {
    mockSignIn.mockImplementationOnce(() => new Promise(() => {})); // never resolves
    render(<LoginPage />);
    await fillLoginForm();
    fireEvent.submit(
      screen.getByRole("button", { name: /log in/i }).closest("form")!,
    );
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /logging in/i });
      expect(btn).toBeDisabled();
    });
  });
});

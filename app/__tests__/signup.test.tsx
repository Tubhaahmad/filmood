/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupPage from "@/app/signup/page";

// ── Module mocks ───────────────────────────────────────────────────────────
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/signup",
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

// Supabase mock
const mockSignUp = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

// ── Helpers ────────────────────────────────────────────────────────────────
async function fillSignupForm({
  name = "Alice Smith",
  email = "alice@example.com",
  password = "secret123",
  confirm = "secret123",
}: {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
} = {}) {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText("Your name"), name);
  await user.type(screen.getByPlaceholderText("you@example.com"), email);
  // Password and confirm-password share the same placeholder pattern — grab all
  const [pwdInput, confirmInput] =
    screen.getAllByPlaceholderText(/character|re-enter/i);
  await user.type(pwdInput, password);
  await user.type(confirmInput, confirm);
}

function submitForm() {
  fireEvent.submit(
    screen.getByRole("button", { name: /^sign up$/i }).closest("form")!,
  );
}

beforeEach(() => {
  mockSignUp.mockResolvedValue({ error: null });
  (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    json: async () => ({ results: [] }),
  } as unknown as Response);
});

afterEach(() => vi.clearAllMocks());

describe("SignupPage", () => {
  // ── Rendering ─────────────────────────────────────────────────────────
  it("renders name, email, password, and confirm password fields", () => {
    render(<SignupPage />);
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/at least 6 characters/i),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/re-enter/i)).toBeInTheDocument();
  });

  // ── Validation errors ─────────────────────────────────────────────────
  it("shows name error when name is too short (< 3 chars)", async () => {
    render(<SignupPage />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Your name"), "Al");
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it("shows email required error on empty email", async () => {
    render(<SignupPage />);
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it("shows password error when password is < 6 characters", async () => {
    render(<SignupPage />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Your name"), "Alice");
    await user.type(screen.getByPlaceholderText("you@example.com"), "a@b.com");
    await user.type(
      screen.getByPlaceholderText(/at least 6 characters/i),
      "123",
    );
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it("shows 'Passwords do not match' when confirm password differs", async () => {
    render(<SignupPage />);
    await fillSignupForm({ confirm: "different" });
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  // ── Supabase interaction ──────────────────────────────────────────────
  it("calls supabase.auth.signUp with correct data on valid form", async () => {
    render(<SignupPage />);
    await fillSignupForm();
    submitForm();
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "alice@example.com",
        password: "secret123",
        options: { data: { name: "Alice Smith" } },
      });
    });
  });

  it("shows the success message after signup", async () => {
    render(<SignupPage />);
    await fillSignupForm();
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/account created/i)).toBeInTheDocument();
    });
  });

  it("shows Supabase error when signUp fails", async () => {
    mockSignUp.mockResolvedValueOnce({
      error: { message: "Email already registered" },
    });
    render(<SignupPage />);
    await fillSignupForm();
    submitForm();
    await waitFor(() => {
      expect(screen.getByText("Email already registered")).toBeInTheDocument();
    });
  });

  // ── Loading and disabled states ───────────────────────────────────────
  it("submit button is disabled and shows loading text while in-flight", async () => {
    mockSignUp.mockImplementationOnce(() => new Promise(() => {})); // never resolves
    render(<SignupPage />);
    await fillSignupForm();
    submitForm();
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /creating account/i });
      expect(btn).toBeDisabled();
    });
  });

  it("submit button is disabled after successful signup (prevents double-submit)", async () => {
    render(<SignupPage />);
    await fillSignupForm();
    submitForm();
    // After success, `success` state is true → button gets disabled
    await waitFor(() => {
      expect(screen.getByText(/account created/i)).toBeInTheDocument();
    });
    // The button now has disabled={loading || success} = disabled={false || true}
    const btn = screen.getByRole("button", { name: /sign up/i });
    expect(btn).toBeDisabled();
  });
});

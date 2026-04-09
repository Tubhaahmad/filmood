/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SessionJoin from "@/components/group/SessionJoin";

// ── Module mocks ───────────────────────────────────────────────────────────
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/getAuthToken", () => ({
  getAuthHeaders: vi
    .fn()
    .mockResolvedValue({ "Content-Type": "application/json" }),
}));

// Default: guest (no auth user)
vi.mock("@/components/AuthProvider", () => ({
  useAuth: vi.fn(() => ({ user: null, loading: false, signOut: vi.fn() })),
}));

// ── Helpers ────────────────────────────────────────────────────────────────
/** Convenience: render with a pre-filled 6-char code so the submit button is enabled */
function renderWithCode(initialCode = "ABC123") {
  return render(<SessionJoin initialCode={initialCode} />);
}

/** Type a value into the nickname field (guest mode only) */
async function typeNickname(value: string) {
  const user = userEvent.setup();
  const nick = screen.getByPlaceholderText("Your nickname");
  await user.clear(nick);
  await user.type(nick, value);
}

/** Reset fetch mock before each test */
beforeEach(() => {
  (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    json: async () => ({ participantId: "p-1", code: "ABC123" }),
  } as unknown as Response);
});

afterEach(() => vi.clearAllMocks());

describe("SessionJoin", () => {
  // ── Code validation ────────────────────────────────────────────────────
  it("submit button is disabled when the code is empty (< 6 chars)", () => {
    render(<SessionJoin />);
    expect(
      screen.getByRole("button", { name: /join session/i }),
    ).toBeDisabled();
  });

  it("submit button is disabled until all 6 code slots are filled", async () => {
    render(<SessionJoin initialCode="ABC" />); // only 3 chars → isFilled = false
    expect(
      screen.getByRole("button", { name: /join session/i }),
    ).toBeDisabled();
  });

  it("submit button is enabled when initialCode has exactly 6 characters", () => {
    renderWithCode("ABC123");
    expect(
      screen.getByRole("button", { name: /join session/i }),
    ).not.toBeDisabled();
  });

  // ── Nickname validation (guest mode) ───────────────────────────────────
  it("shows the nickname field for guests (no user)", () => {
    renderWithCode();
    expect(screen.getByPlaceholderText("Your nickname")).toBeInTheDocument();
  });

  it("shows error when nickname is empty and guest submits", async () => {
    renderWithCode();
    fireEvent.click(screen.getByRole("button", { name: /join session/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/nickname must be at least 2 characters/i),
      ).toBeInTheDocument();
    });
  });

  it("shows error when nickname is 1 character (too short)", async () => {
    renderWithCode();
    await typeNickname("A");
    fireEvent.click(screen.getByRole("button", { name: /join session/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/nickname must be at least 2 characters/i),
      ).toBeInTheDocument();
    });
  });

  it("does NOT show nickname error when nickname is >= 2 chars", async () => {
    renderWithCode();
    await typeNickname("Al");
    fireEvent.click(screen.getByRole("button", { name: /join session/i }));
    await waitFor(() => {
      expect(
        screen.queryByText(/nickname must be at least 2 characters/i),
      ).not.toBeInTheDocument();
    });
  });

  // ── Successful join ────────────────────────────────────────────────────
  it("calls fetch /api/group/join when form is valid", async () => {
    renderWithCode();
    await typeNickname("Alice");
    fireEvent.click(screen.getByRole("button", { name: /join session/i }));
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/group/join",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("sends code and nickname in the request body for guests", async () => {
    renderWithCode("DEF456");
    await typeNickname("Alice");
    fireEvent.click(screen.getByRole("button", { name: /join session/i }));
    await waitFor(() => {
      const calls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls;
      const body = JSON.parse(calls[0][1].body);
      expect(body.code).toBe("DEF456");
      expect(body.nickname).toBe("Alice");
    });
  });

  it("navigates to /group/[code] on success", async () => {
    renderWithCode();
    await typeNickname("Alice");
    fireEvent.click(screen.getByRole("button", { name: /join session/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/group/ABC123");
    });
  });

  // ── Error from API ─────────────────────────────────────────────────────
  it("shows the error message returned by the API on failure", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Session not found" }),
    } as unknown as Response);

    renderWithCode();
    await typeNickname("Alice");
    fireEvent.click(screen.getByRole("button", { name: /join session/i }));
    await waitFor(() => {
      expect(screen.getByText("Session not found")).toBeInTheDocument();
    });
  });

  it('shows "Something went wrong" when fetch throws a network error', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network error"),
    );
    renderWithCode();
    await typeNickname("Alice");
    fireEvent.click(screen.getByRole("button", { name: /join session/i }));
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  // ── Loading state ─────────────────────────────────────────────────────
  it('shows "Joining..." text in the button while loading', async () => {
    // Use a never-resolving promise to keep loading indefinitely
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise(() => {}),
    );
    renderWithCode();
    await typeNickname("Alice");
    fireEvent.click(screen.getByRole("button", { name: /join session/i }));
    await waitFor(() => {
      expect(screen.getByText(/joining\.\.\./i)).toBeInTheDocument();
    });
  });
});

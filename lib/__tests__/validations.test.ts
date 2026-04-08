import { loginSchema, signupSchema } from "@/lib/validations";

describe("loginSchema", () => {
  it("accepts valid email and password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "secret123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "secret123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailErrors = result.error.issues.filter((i) => i.path[0] === "email");
      expect(emailErrors.length).toBeGreaterThan(0);
    }
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret123" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const pwErrors = result.error.issues.filter((i) => i.path[0] === "password");
      expect(pwErrors.length).toBeGreaterThan(0);
    }
  });

  it("rejects when both fields are missing", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  const validData = {
    name: "Sergiu",
    email: "sergiu@example.com",
    password: "pass123",
    confirmPassword: "pass123",
  };

  it("accepts valid signup data", () => {
    const result = signupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 3 characters", () => {
    const result = signupSchema.safeParse({ ...validData, name: "AB" });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 50 characters", () => {
    const result = signupSchema.safeParse({ ...validData, name: "A".repeat(51) });
    expect(result.success).toBe(false);
  });

  it("accepts name at exactly 3 characters (boundary)", () => {
    const result = signupSchema.safeParse({ ...validData, name: "ABC" });
    expect(result.success).toBe(true);
  });

  it("accepts name at exactly 50 characters (boundary)", () => {
    const result = signupSchema.safeParse({ ...validData, name: "A".repeat(50) });
    expect(result.success).toBe(true);
  });

  it("rejects password shorter than 6 characters", () => {
    const result = signupSchema.safeParse({ ...validData, password: "12345", confirmPassword: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects when passwords do not match", () => {
    const result = signupSchema.safeParse({ ...validData, password: "pass123", confirmPassword: "different" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const matchError = result.error.issues.find((i) => i.path[0] === "confirmPassword");
      expect(matchError?.message).toBe("Passwords do not match");
    }
  });

  it("rejects invalid email in signup", () => {
    const result = signupSchema.safeParse({ ...validData, email: "bad-email" });
    expect(result.success).toBe(false);
  });
});

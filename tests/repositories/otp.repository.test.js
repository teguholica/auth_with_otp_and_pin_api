const otpRepo = require("../../src/repositories/otp.repository");

describe("OtpRepository", () => {
  it("should delete non-existing OTP without error", async () => {
    expect(() => otpRepo.delete("nouser@example.com")).not.toThrow();
  });
});

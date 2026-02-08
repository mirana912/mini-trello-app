// app/auth/signup/page.tsx
// ==========================================
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { FaGithub, FaEnvelope } from "react-icons/fa";
import { signInWithGitHub, sendVerificationCode, verifyCode } from "@/lib/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUser } from "@/lib/firestore";

export default function SignUpPage() {
  const router = useRouter();

  // User input states
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Send verification code to user's email address
  const handleSendCode = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await sendVerificationCode(userEmail);
      setIsCodeSent(true);
      alert(`Verification code sent to ${userEmail}. Please check your email!`);
    } catch (error: any) {
      setError(error.message);
      console.log("Failed to send verification code:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create new user account
  const handleSignUp = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isValid = await verifyCode(userEmail, verificationCode);

      if (!isValid) {
        throw new Error("Invalid verification code. Please try again.");
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userEmail,
        verificationCode,
      );
      const user = userCredential.user;
      await createUser(user.uid, userEmail, userName);
      router.push("/dashboard");
    } catch (error: any) {
      // Handle duplicate email error
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setError(error.message);
      }
      console.log("Account creation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Register with GitHub OAuth
  const handleGitHubSignUp = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGitHub();
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message);
      console.log("GitHub registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Create Account</h2>
                <p className="text-muted">Sign up to get started</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              {!isCodeSent ? (
                <Form onSubmit={handleSendCode}>
                  <Form.Group className="mb-3">
                    <Form.Label>Display Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    <FaEnvelope className="me-2" />
                    {loading ? "Sending..." : "Send Verification Code"}
                  </Button>
                </Form>
              ) : (
                <Form onSubmit={handleSignUp}>
                  <Alert variant="info" className="mb-3">
                    <small>
                      <strong>Email:</strong> {userEmail}
                      <br />
                      <strong>Name:</strong> {userName}
                    </small>
                  </Alert>

                  <Form.Group className="mb-3">
                    <Form.Label>Verification Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                      maxLength={6}
                      disabled={loading}
                    />
                    <Form.Text className="text-muted">
                      Check your email for the verification code
                    </Form.Text>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>

                  <Button
                    variant="link"
                    className="w-100 text-muted"
                    onClick={() => setIsCodeSent(false)}
                    disabled={loading}
                  >
                    Use different email
                  </Button>
                </Form>
              )}

              <div className="position-relative my-4">
                <hr />
                <span
                  className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted"
                  style={{ fontSize: "0.875rem" }}
                >
                  OR
                </span>
              </div>

              <Button
                variant="dark"
                className="w-100 mb-3"
                onClick={handleGitHubSignUp}
                disabled={loading}
              >
                <FaGithub className="me-2" />
                Sign up with GitHub
              </Button>

              <div className="text-center mt-4">
                <p className="text-muted mb-0">
                  Already have an account?{" "}
                  <Link
                    href="/auth/signin"
                    className="text-primary fw-semibold"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
// ==========================================

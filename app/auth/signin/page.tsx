// app/auth/signin/page.tsx
// ==========================================
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  signInWithGitHub,
  sendVerificationCode,
  verifyCode,
} from "../../../lib/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../lib/firebase";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await sendVerificationCode(email);
      setCodeSent(true);
      alert(`Verification code is sent to ${email}. Please check your email.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isValid = await verifyCode(email, code);
      if (!isValid) {
        throw new Error("Invalid verification code.");
      }
      try {
        await signInWithEmailAndPassword(auth, email, code);
      } catch {
        alert("User not found. Please sign up first.");
        router.push("/auth/signup");
        return;
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGitHub();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
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
                <h2 className="fw-bold">Welcome Back</h2>
                <p className="text-muted">Sign in to your account</p>
              </div>
              {error && <Alert variant="danger">{error}</Alert>}
              {!codeSent ? (
                <Form onSubmit={handleSendCode}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                <Form onSubmit={handleSignIn}>
                  <Form.Group className="mb-3">
                    <Form.Label>Verification Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
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
                    {loading ? "Verifying..." : "Sign In"}
                  </Button>
                  <Button
                    variant="link"
                    className="w-100 text-muted"
                    onClick={() => setCodeSent(false)}
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
                onClick={handleGitHubSignIn}
                disabled={loading}
              >
                <FaGithub className="me-2" />
                Sign in with GitHub
              </Button>
              <div className="text-center mt-4">
                <p className="text-muted mb-0">
                  Doesn't have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-primary fw-semibold"
                  >
                    Sign up
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

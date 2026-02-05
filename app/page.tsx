// app/page.tsx
// ==========================================
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaCheckCircle, FaUsers, FaTasks, FaGithub } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Container className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-vh-100">
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <Container className="py-5">
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h1 className="display-3 fw-bold mb-4">Mini Trello</h1>
              <p className="lead mb-4">
                Collaborate on boards, track tasks, and monitor progress in
                real-time. Perfect for teams that want to stay organized and
                productive.
              </p>
              <div className="d-flex gap-3">
                <Link href="/auth/signup">
                  <Button variant="light" size="lg" className="px-4">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline-light" size="lg" className="px-4">
                    Sign In
                  </Button>
                </Link>
              </div>
            </Col>
            <Col lg={6}>
              <div className="bg-white rounded-3 shadow-lg p-4">
                <div className="bg-light rounded-2 p-4 mb-3">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="bg-primary rounded-circle me-3"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <div className="flex-grow-1">
                      <div
                        className="bg-secondary rounded"
                        style={{ height: "12px", width: "60%" }}
                      />
                    </div>
                  </div>
                  <div className="row g-2">
                    {[1, 2, 3].map((i) => (
                      <div className="col-4" key={i}>
                        <div className="bg-white rounded-2 p-3 shadow-sm">
                          <div
                            className="bg-secondary rounded mb-2"
                            style={{ height: "8px", width: "80%" }}
                          />
                          <div
                            className="bg-light rounded"
                            style={{ height: "6px", width: "60%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 my-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Why Mini Trello?</h2>
            <p className="lead text-muted">
              Everything you need to manage your projects effectively
            </p>
          </div>

          <Row className="g-4">
            <Col md={6} lg={3}>
              <div className="text-center p-4">
                <div
                  className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "80px", height: "80px" }}
                >
                  <FaTasks className="text-primary" size={32} />
                </div>
                <h5 className="fw-bold mb-2">Task Management</h5>
                <p className="text-muted">
                  Create, organize, and track tasks with drag-and-drop
                  simplicity
                </p>
              </div>
            </Col>

            <Col md={6} lg={3}>
              <div className="text-center p-4">
                <div
                  className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "80px", height: "80px" }}
                >
                  <FaUsers className="text-success" size={32} />
                </div>
                <h5 className="fw-bold mb-2">Team Collaboration</h5>
                <p className="text-muted">
                  Invite team members and collaborate in real-time
                </p>
              </div>
            </Col>

            <Col md={6} lg={3}>
              <div className="text-center p-4">
                <div
                  className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "80px", height: "80px" }}
                >
                  <FaCheckCircle className="text-warning" size={32} />
                </div>
                <h5 className="fw-bold mb-2">Real-Time Updates</h5>
                <p className="text-muted">
                  See changes instantly across all connected users
                </p>
              </div>
            </Col>

            <Col md={6} lg={3}>
              <div className="text-center p-4">
                <div
                  className="bg-dark bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "80px", height: "80px" }}
                >
                  <FaGithub className="text-dark" size={32} />
                </div>
                <h5 className="fw-bold mb-2">GitHub Integration</h5>
                <p className="text-muted">
                  Link PRs, commits, and issues directly to your tasks
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-light py-5 my-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-5 fw-bold mb-3">
                Ready to get organized?
              </h2>
              <p className="lead text-muted mb-4">
                Join thousands of teams already using Mini Trello to streamline
                their workflow
              </p>
              <Link href="/auth/signup">
                <Button variant="primary" size="lg" className="px-5">
                  Start Free Today
                </Button>
              </Link>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <Container>
          <Row>
            <Col className="text-center">
              <p className="mb-0">
                &copy; {new Date().getFullYear()} Mini Trello. All rights
                reserved.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}
// ==========================================

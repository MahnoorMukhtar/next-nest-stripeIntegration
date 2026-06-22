import Link from "next/link";

export default function CancelPage() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>❌ Payment Canceled</h1>
      <p>Your payment was not completed. No charges were made.</p>
      <Link href="/payment" style={{ color: "blue", textDecoration: "underline" }}>
        Try again
      </Link>
    </div>
  );
}
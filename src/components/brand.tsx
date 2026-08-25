import Link from "next/link";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="brand" aria-label="Minima ana səhifə">
      <span className="brand-mark" aria-hidden="true">
        🌿
      </span>
      <span>Minima</span>
    </Link>
  );
}

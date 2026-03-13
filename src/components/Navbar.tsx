import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/applications/new", label: "Add Application" },
  { href: "/contacts", label: "Contacts" },
  { href: "/contacts/new", label: "Add Contact" },
];

export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          CareerFlow
        </Link>

        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
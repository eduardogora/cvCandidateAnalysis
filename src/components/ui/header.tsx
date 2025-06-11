import Link from "next/link";
import Image from "next/image";

const Header = () => {
  return (
    <header className="bg-blue-700 text-white">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-700 font-bold text-xl">P</span>
          </div>
          <span className="text-2xl font-bold">PiSA</span>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/jobs" className="hover:underline">
                Jobs
              </Link>
            </li>
            <li>
              <Link href="https://www.pisa.com.mx/contacto/" className="hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/PisaManager" className="hover:underline">
                LogIn
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

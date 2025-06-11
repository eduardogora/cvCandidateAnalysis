import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">About Pisa</h3>
            <p className="text-gray-600">
              Pisa is a leading technology company specializing in innovative solutions that power businesses worldwide.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Careers</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/jobs" className="text-blue-600 hover:underline">
                  Open Positions
                </Link>
              </li>
              <li>
                <Link href="/company-culture" className="text-blue-600 hover:underline">
                  Our Culture
                </Link>
              </li>
              <li>
                <Link href="/benefits" className="text-blue-600 hover:underline">
                  Benefits
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-blue-600 hover:underline">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-blue-600 hover:underline">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-blue-600 hover:underline">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-blue-600 hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="https://linkedin.com" target="_blank" className="text-blue-600 hover:underline">
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href="https://twitter.com" target="_blank" className="text-blue-600 hover:underline">
                  Twitter
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Pisa, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useMemo } from 'react';
import Head from 'next/head';

import Link from 'next/link';

const Header = ({ user }) => {
  const links = useMemo(() => {
    const linkOptions = [
      !user && { label: 'Sign Up', href: '/auth/signup' },
      !user && { label: 'Sign In', href: '/auth/signin' },
      !!user && { label: 'Sell Tickets', href: '/tickets/new' },
      !!user && { label: 'My Orders', href: '/orders' },
      !!user && { label: 'Sign Out', href: '/auth/signout' },
    ];

    return linkOptions
      .filter(option => !!option)
      .map(({ label, href }) => (
        <li key={href} className="nav-item">
          <Link href={href}>
            <a className="nav-link text-light">{label}</a>
          </Link>
        </li>
      ));
  }, [user]);

  return (
    <>
      <Head>
        <title>Ticketing</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="navbar navbar-dark bg-primary mb-4">
        <div className="container">
          <Link href="/">
            <a className="navbar-brand">GitTix</a>
          </Link>

          <ul className="nav">
            {links}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Header;

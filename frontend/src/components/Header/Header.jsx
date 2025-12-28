import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function Header() {

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'About Us', path: '/aboutUs' },
  ]

  const navLinkClass = ({ isActive }) =>
    `block py-2 pr-4 pl-3 duration-200
    ${isActive ? "text-orange-800" : "text-gray-700"}
    border-b border-gray-100 hover:bg-gray-50
    lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`;

  return (
    <header className="shadow sticky z-50 top-0">
      <nav className="bg-[#101010] shadow-amber-100 border-gray-200 px-4 lg:px-6 py-2.5">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-7xl">
          <Link to="/" className="flex items-center">
            <img
              src="/IOTHeaderLogo.png"
              className="mr-3 h-15"
              alt="Logo"
            />
          </Link>
          <div className="flex items-center lg:order-2">
            <Link
              to="#"
              className="text-black bg-gray-200 hover:bg-gray-400 font-mono focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
            >
              Log in
            </Link>
            <Link
              to="#"
              className="text-white bg-orange-700 hover:bg-orange-800 font-mono focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
            >
              Sign Up
            </Link>
          </div>
          <div
            className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1"
            id="mobile-menu-2"
          >

            <ul className="flex flex-col mt-4 font-mono font-medium lg:flex-row lg:space-x-8 lg:mt-0">
              {navItems.map(({ name, path }) => (
                <li key={path}>
                  <NavLink to={path} className={navLinkClass}>
                    {name}
                  </NavLink>
                </li>
              ))}
            </ul>

          </div>
        </div>
      </nav>
    </header>
  );
}
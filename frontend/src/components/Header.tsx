import { NavLink } from "react-router-dom";

const Header = () => (
  <header className="bg-background border-b border-border sticky top-0 z-50">
    <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
      <NavLink to="/" className="text-xl font-bold text-foreground">
        TryOn<span className="text-primary">.</span>
      </NavLink>
      <nav className="flex gap-6">
        <NavLink
          to="/try-on"
          className={({ isActive }) =>
            `text-sm font-medium text-foreground pb-1 border-b-2 transition-colors ${
              isActive ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
            }`
          }
        >
          Try It On
        </NavLink>
        <NavLink
          to="/style"
          className={({ isActive }) =>
            `text-sm font-medium text-foreground pb-1 border-b-2 transition-colors ${
              isActive ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
            }`
          }
        >
          Style Suggestions
        </NavLink>
      </nav>
    </div>
  </header>
);

export default Header;

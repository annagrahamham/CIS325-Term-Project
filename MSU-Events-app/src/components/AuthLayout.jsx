function AuthLayout({ title, subtitle, children }) {
  return (
    <section className="container auth-shell" role="region" aria-label={title}>
      <header className="auth-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

export default AuthLayout;

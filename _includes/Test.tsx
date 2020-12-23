type Props = {
  className?: string;
  children?: any;
};

export default ({ className, children }: Props) => {
  return (
    <header id="Test" className={className}>
      Hello, {children}
    </header>
  );
};

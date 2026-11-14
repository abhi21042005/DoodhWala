// card component with composition pattern (children-based)
// usage: <Card><Card.Header>Title</Card.Header><Card.Body>...</Card.Body></Card>

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-4 py-3 border-b border-gray-200 sm:px-6 ${className}`}>
      {typeof children === 'string' ? (
        <h3 className="text-lg font-semibold font-serif text-gray-800">{children}</h3>
      ) : (
        children
      )}
    </div>
  );
}

function CardBody({ children, className = '' }) {
  return <div className={`px-4 py-4 sm:px-6 ${className}`}>{children}</div>;
}

function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-4 py-3 border-t border-gray-200 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;

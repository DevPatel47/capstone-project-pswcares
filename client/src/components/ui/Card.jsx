const Card = ({ children, hover = false, className = "", ...props }) => {
  return (
    <div
      className={`${hover ? "app-card-hover" : "app-card"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

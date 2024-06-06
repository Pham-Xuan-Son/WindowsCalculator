function ButtonBox({ children }) {
  return (
    <div
      style={{
        width: "100%",
        height: "calc(100% - 110px)",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "repeat(5, 1fr)",
        gridGap: "1px",
      }}
    >
      {children}
    </div>
  );
}
export default ButtonBox;

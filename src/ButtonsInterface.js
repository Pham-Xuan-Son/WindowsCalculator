function ButtonsInterface({ onClick, value, condition }) {
  return (
    <button value={value} onClick={onClick} disabled={condition}>
      {value}
    </button>
  );
}
export default ButtonsInterface;

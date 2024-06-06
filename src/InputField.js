function InputField({ values }) {
  return (
    <input
      type="text"
      value={values}
      style={{
        textAlign: "right",
        height: "20px",
        width: "220px",
        color: "black",
      }}
      disabled
    />
  );
}
export default InputField;

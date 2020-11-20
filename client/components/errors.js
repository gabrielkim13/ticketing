const Errors = ({ errors }) => {
  return (
    <>
      {
        errors && errors.length > 0 &&
        <div className="alert alert-danger">
          <h4>Oops...</h4>

          <ul>
            {errors.map(({ message, field }) => <li key={message}>{`${field}: ${message}`}</li>)}
          </ul>
        </div>
      }
    </>
  );
}

export default Errors;

function Spinner() {
  return (
    <div className="loader p-5 rounded-full flex space-x-3">
      <div className="w-5 h-5 bg-white rounded-full animate-bounce"></div>
      <div className="w-5 h-5 bg-white rounded-full animate-bounce"></div>
      <div className="w-5 h-5 bg-white rounded-full animate-bounce"></div>
    </div>
  );
}

export default Spinner;

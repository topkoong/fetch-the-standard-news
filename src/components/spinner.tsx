function Spinner() {
  return (
    <div
      className='loader p-5 rounded-full flex space-x-3'
      role='status'
      aria-live='polite'
      aria-label='Loading'
    >
      <div className='w-5 h-5 bg-white rounded-full animate-bounce' />
      <div className='w-5 h-5 bg-white rounded-full animate-bounce' />
      <div className='w-5 h-5 bg-white rounded-full animate-bounce' />
    </div>
  );
}

export default Spinner;

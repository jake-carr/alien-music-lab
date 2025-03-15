const MobileNotice = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8 text-center">
      <img 
        src="/images/aliens.png"
        alt="Alien Musicians"
        className="w-64 h-64 rounded-lg mb-8 object-cover"
      />
      <h1 className="text-green-600 text-xl font-bold mb-2">
        Mobile Version Coming Soon
      </h1>
      <p className="text-gray-300 text-lg mb-2">
        The aliens are still fine-tuning some of their instruments.
      </p>
      <p className="text-gray-400 text-base max-w-md">
        For now, please access Alien Music Lab on a desktop browser or tablet with a screen width of at least 1024px.
      </p>
    </div>
  );
};

export default MobileNotice;

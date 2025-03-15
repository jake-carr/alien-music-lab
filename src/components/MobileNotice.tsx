const MobileNotice = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8 text-center">
      <img 
        src="/images/aliens.png"
        alt="Alien Musicians"
        className="w-64 h-64 rounded-lg mb-8 object-cover opacity-90"
      />
      <h1 className="font-['Space_Grotesk'] text-xl font-bold mb-2">
        <span className="text-green-500">Alien</span>
        <span className="text-white"> Music Lab</span>
      </h1>
      <p className="text-white text-lg mb-2">
        Sorry - the aliens are still fine-tuning some of their instruments.
      </p>
      <p className="text-gray-400 text-base max-w-md">
        Mobile development is underway. For now, please access the app on a desktop browser or device with a screen width of at least 1024px.
      </p>
    </div>
  );
};

export default MobileNotice;

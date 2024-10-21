import React, { useState, useEffect, useCallback } from 'react';
import CountdownTimer from './CountdownTimer';
import ReservationModal from './ReservationModal';
import ImageModal from './ImageModal';
import './Home.css';

function Home() {
  const [designs, setDesigns] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const loadDesigns = useCallback(() => {
    const storedDesigns = JSON.parse(localStorage.getItem('designs') || '[]');
    setDesigns(storedDesigns);
  }, []);

  useEffect(() => {
    loadDesigns();
  }, [loadDesigns]);

  const handleReserve = (design) => {
    setSelectedDesign(design);
  };

  const handleReservationComplete = (designId, reservationData) => {
    setDesigns(prevDesigns => {
      const updatedDesigns = prevDesigns.map(design => {
        if (design.id === designId) {
          const newBuyers = design.buyers + reservationData.quantity;
          const newStartDate = design.startDate || new Date().toISOString();
          return { ...design, buyers: newBuyers, startDate: newStartDate };
        }
        return design;
      });
      localStorage.setItem('designs', JSON.stringify(updatedDesigns));
      return updatedDesigns;
    });

    // 予約情報を保存
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const newReservation = {
      id: Date.now(),
      designId: designId,
      email: reservationData.email,
      quantity: reservationData.quantity,
      timestamp: new Date().toISOString()
    };
    reservations.push(newReservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));

    setSelectedDesign(null);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const getCarModelName = (carModel) => {
    switch(carModel) {
      case 'jimny':
        return 'ジムニーJB74';
      case 'gryaris-gxpa16':
        return 'GRヤリスGXPA16前期型';
      case 'gryaris-mxpa12':
        return 'GRヤリスMXPA12前期型';
      case 'swift':
        return 'スイフトZC33';
      case '86-zn6':
        return '86 ZN6前期';
      default:
        return carModel;
    }
  };

  const filteredDesigns = filter === 'all' ? designs : designs.filter(design => design.carModel === filter);

  return (
    <div className="home">
      <div className="product-info">
        <h3>製品情報</h3>
        <p><strong>製品内容:</strong> ゲージパネルのみ（メータークラスター、針などは含まれません）</p>
        <p><strong>対応車種:</strong> ジムニーJB74、GRヤリスGXPA16前期型、GRヤリスMXPA12前期型、スイフトZC33、86 ZN6前期</p>
        <p><strong>最大生産枚数:</strong> 30枚</p>
        <p><strong>製品化条件:</strong> 10枚の予約達成</p>
        <p><strong>予約期間:</strong> 最初の予約から10日間</p>
        <p><strong>配送:</strong> 締め切り後約1ヶ月でお届け</p>
        <p><strong>送料:</strong> 770円</p>
      </div>

      <div className="filter-buttons">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>すべて</button>
        <button onClick={() => setFilter('jimny')} className={filter === 'jimny' ? 'active' : ''}>ジムニー</button>
        <button onClick={() => setFilter('gryaris-gxpa16')} className={filter === 'gryaris-gxpa16' ? 'active' : ''}>GRヤリスGXPA16</button>
        <button onClick={() => setFilter('gryaris-mxpa12')} className={filter === 'gryaris-mxpa12' ? 'active' : ''}>GRヤリスMXPA12</button>
        <button onClick={() => setFilter('swift')} className={filter === 'swift' ? 'active' : ''}>スイフト</button>
        <button onClick={() => setFilter('86-zn6')} className={filter === '86-zn6' ? 'active' : ''}>86 ZN6</button>
      </div>

      <div className="design-grid">
        {filteredDesigns.map(design => (
          <div key={design.id} className="design-item">
            <div className="design-image-container">
              <img
                src={design.image}
                alt={`デザイン ${design.designNumber}`}
                className="design-image"
                onClick={() => handleImageClick(design.image)}
              />
            </div>
            <div className="design-info">
              <h3>{design.designNumber}</h3>
              <p className="car-model">{getCarModelName(design.carModel)}</p>
              <p className="price">¥{design.price.toLocaleString()}</p>
              <CountdownTimer
                startDate={design.startDate}
                buyers={design.buyers}
                onCountdownEnd={loadDesigns}
              />
              {design.buyers < 30 && (
                <button className="reserve-button" onClick={() => handleReserve(design)}>予約する</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedDesign && (
        <ReservationModal
          design={selectedDesign}
          onClose={() => setSelectedDesign(null)}
          onReservationComplete={handleReservationComplete}
          maxQuantity={30 - selectedDesign.buyers}
        />
      )}

      {showImageModal && (
        <ImageModal
          image={selectedImage}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
}

export default Home;
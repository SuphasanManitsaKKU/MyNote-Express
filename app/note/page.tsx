'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Card from "./components/card";
import Image from "next/image";
import Swal from 'sweetalert2';
import axios from 'axios';
import { useRouter } from "next/navigation";
import debounce from 'lodash.debounce';

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cardColor, setCardColor] = useState('bg-white');
  const [date, setDate] = useState('2020-08-03');
  const [selectedColor, setSelectedColor] = useState('bg-white');
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);  // ระบุชนิดของ ref ที่นี่
  const [cards, setCards] = useState<{ cardId: string; title: string; content: string; cardColor: string; date: string; userId: string; isEditing: boolean }[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // สร้าง state แยกเพื่อใช้กับ debounce
  const titleInputRef = useRef<HTMLInputElement>(null);

  function handleColorChange(color: string) {
    setCardColor(color);
    setSelectedColor(color);
  }

  function handleCreateCard() {
    setIsPopupOpen(true);
  }

  function handleClosePopup() {
    setTitle("");
    setContent("");
    setIsPopupOpen(false);
  }

  async function handleSaveCard() {
    if (title.trim() === "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please enter a title for the card!',
        confirmButtonColor: '#38bdf8', 
        customClass: {
          confirmButton: 'text-white', 
        }
      });
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/notes`, {
        title: title,
        content: content,
        color: cardColor,
        userId: userId
      }, {
        withCredentials: true
      });

      const newIs = await response.data.noteId;
      setCards([
        ...cards,
        { cardId: newIs, title: title.trim(), content, cardColor, date, userId: userId, isEditing: false }
      ]);

    } catch (error) {
      console.error('There was an error fetching the notes:', error);
    }

    setTitle("");
    setContent("");
    setCardColor('bg-white');
    setIsPopupOpen(false);
  }

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_WEB}/api/getCookie`);
      return response.data.userId;
    } catch (error) {
      console.error('There was an error fetching the notes:', error);
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const userId = await fetchData();
        setUserId(userId);

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/notes/${userId}`,
          {
            withCredentials: true
          }
        );

        const fetchedCards = response.data.map((note: any) => ({
          cardId: note.noteId,
          title: note.title,
          content: note.content,
          cardColor: note.color,
          date: note.date,
          userId: note.userId,
          isEditing: false
        }));
        setCards(fetchedCards);
      } catch (error) {
        console.error('There was an error fetching the notes:', error);
      }
    };

    if (userId !== null) {
      fetchNotes();
    }
  }, [userId]);

  useEffect(() => {
    if (isPopupOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isPopupOpen]);

  function handleLogout() {
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have successfully logged out!',
      confirmButtonColor: '#38bdf8', 
        customClass: {
          confirmButton: 'text-white', 
        }
    });
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_WEB}/api/removeCookie`);
      } catch (error) {
        console.error('There was an error logging out:', error);
      }
    };
    fetchData().then(() => {
      router.push('/');
    });
  }

  function handleDeleteCard(id: string) {
    console.log('Deleting card with ID:', id);

    // ใช้ prevState ในการอัพเดต state เพื่อแน่ใจว่า state ที่อัพเดตเป็นตัวล่าสุด
    setCards(prevCards => prevCards.filter(card => card.cardId !== id));

    // Log หลังจาก set state อาจไม่แสดง state ที่อัพเดตใหม่ทันทีเนื่องจาก setCards ทำงานแบบ asynchronous
    console.log('Updated cards after deletion');
  }
  useEffect(() => {
    console.log('Cards have been updated', cards);
  }, [cards]);

  // ใช้ useEffect สำหรับ debounce เพื่อเลื่อนการค้นหา
  useEffect(() => {
    const debouncedHandler = debounce(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    debouncedHandler();

    return () => {
      debouncedHandler.cancel();
    };
  }, [searchTerm]);

  const filteredCards = useMemo(() => {
    if (!searchTerm.trim()) {
      return cards; // ถ้าไม่มีคำค้นหา ให้แสดงผลทั้งหมด
    }

    const searchLower = searchTerm.toLowerCase().trim(); // แปลงคำค้นหาเป็นตัวพิมพ์เล็กและลบช่องว่าง

    return cards.filter((card) => {
      // แปลง title และ content เป็นตัวพิมพ์เล็ก
      const titleLower = card.title.toLowerCase();
      const contentLower = card.content.toLowerCase();

      // ตรวจสอบว่าคำค้นหา (searchTerm) อยู่ใน title หรือ content หรือไม่
      return titleLower.includes(searchLower) || contentLower.includes(searchLower);
    });
  }, [cards, searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm('');
    inputRef.current?.focus(); // ให้ focus กลับไปยัง input หลังจากเคลียร์ searchTerm
  };
  interface CardProps {
    cardId: string; title: string; content: string; cardColor: string; date: string; userId: string; isEditing: boolean
  }
  const handleUpdateCard = (updatedCard: CardProps) => {
    setCards(prevCards => prevCards.map(card => card.cardId === updatedCard.cardId ? updatedCard : card));
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Log Out
      </button>

      <h1 className="text-3xl font-bold mb-8 mt-12">My Note</h1>

      <div className="relative mb-6 w-2/3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-full"
          placeholder="Search cards by title or content"
          ref={inputRef}  // ผูก ref ไปยัง input
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch} // ใช้ฟังก์ชัน handleClearSearch สำหรับการคลิก
            className="absolute right-1 top-[12%] bg-gray-200 px-2 py-1 rounded"
          >
            Clear
          </button>
        )}
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full px-4">
        {filteredCards.length > 0 ? (
          filteredCards.map((card) => (
            <Card
              key={card.cardId}
              cardId={card.cardId}
              title={card.title}
              content={card.content}
              cardColor={card.cardColor}
              date={card.date}
              userId={card.userId}
              onDelete={handleDeleteCard}
              onUpdate={handleUpdateCard}
            />
          ))
        ) : (
          <p>No matching cards found</p>
        )}

      </div>

      <div className="fixed bottom-4 right-4">
        <Image
          width={50}
          height={50}
          src="/plus.png"
          alt="Add Card"
          onClick={handleCreateCard}
        />
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <div
            className={`border border-gray-300 rounded-lg shadow-md p-6 m-4 ${cardColor} card-content fixed inset-1/4 w-1/2 h-1/2 z-50 transform scale-105`}>
            <div className='flex flex-col h-full'>
              <div className='flex-grow'>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-none bg-transparent outline-none mb-4"
                  placeholder="Title"
                />
                <hr />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-full border-none bg-transparent outline-none resize-none"
                  placeholder="Content"
                />
              </div>
              <div className='flex justify-between items-center mt-2'>
                <div className='flex gap-2 border p-2 rounded-2xl bg-white'>
                  <button
                    className={`w-6 h-6 rounded-full border ${selectedColor === 'bg-white' ? 'border-black' : ''} bg-white`}
                    onClick={() => handleColorChange('bg-white')}
                    aria-label="White"
                  />
                  <button
                    className={`w-6 h-6 rounded-full border ${selectedColor === '#B3E5FC' ? 'border-black' : ''} bg-[#B3E5FC]`}
                    onClick={() => handleColorChange('bg-[#B3E5FC]')}
                    aria-label="Light Blue"
                  />
                  <button
                    className={`w-6 h-6 rounded-full border ${selectedColor === '#B9FBC0' ? 'border-black' : ''} bg-[#B9FBC0]`}
                    onClick={() => handleColorChange('bg-[#B9FBC0]')}
                    aria-label="Light Green"
                  />
                  <button
                    className={`w-6 h-6 rounded-full border ${selectedColor === '#FFABAB' ? 'border-black' : ''} bg-[#FFABAB]`}
                    onClick={() => handleColorChange('bg-[#FFABAB]')}
                    aria-label="Light Red"
                  />
                  <button
                    className={`w-6 h-6 rounded-full border ${selectedColor === '#FFF9C4' ? 'border-black' : ''} bg-[#FFF9C4]`}
                    onClick={() => handleColorChange('bg-[#FFF9C4]')}
                    aria-label="Light Yellow"
                  />
                  <button
                    className={`w-6 h-6 rounded-full border ${selectedColor === '#CFD8DC' ? 'border-black' : ''} bg-[#CFD8DC]`}
                    onClick={() => handleColorChange('bg-[#CFD8DC]')}
                    aria-label="Light Gray"
                  />
                </div>
                <div className='flex justify-center items-center gap-4'>
                  <button onClick={handleClosePopup} className="text-gray-400">Cancel</button>
                  <button onClick={handleSaveCard} className="bg-sky-400 hover:bg-sky-700 text-white px-3 py-2 rounded-3xl">Create</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

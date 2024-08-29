'use client';

import { useState, useRef, useEffect } from 'react';
import Card from "./components/card";
import Image from "next/image";
import Swal from 'sweetalert2';
import axios from 'axios';
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  // เริ่มต้น userid เป็น null หรือค่าที่ต้องการ
  const [userid, setUserid] = useState(0);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cardColor, setCardColor] = useState('bg-white');
  const [date, setDate] = useState('2020-08-03');
  const [selectedColor, setSelectedColor] = useState('bg-white');
  const [searchTerm, setSearchTerm] = useState("");
  const [cards, setCards] = useState<{ cardId: number; title: string; content: string; cardColor: string; date: string; userid: number; isEditing: boolean }[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_WEB}/api/getCookie`);
        setUserid(response.data.userId);
      } catch (error) {
        console.error('There was an error fetching the notes:', error);
      }
    };
    fetchData();
  }, []);

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

  async function getNextId() {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/nextNoteId`);
      return response.data.nextId;
    } catch (error) {
      console.error('There was an error fetching the notes:', error);
    }
  }

  async function handleSaveCard() {
    if (title.trim() === "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please enter a title for the card!',
      });
      return;
    }

    const newIs = await getNextId();
    const newCard = {
      noteid: newIs,
      title: title,
      content: content,
      color: cardColor,
      date: '',
      userid: userid
    };
    setCards([
      ...cards,
      { cardId: newIs, title: title.trim(), content, cardColor, date, userid: userid, isEditing: false }
    ]);
    const fetchNotes = async (newIs: any) => {
      try {
        console.log(newCard);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/api/notes`, newCard);
        console.log("Card saved successfully");
      } catch (error) {
        console.error('There was an error fetching the notes:', error);
      }
    };

    fetchNotes(newIs);

    setTitle("");
    setContent("");
    setCardColor('bg-white');
    setIsPopupOpen(false);
  }

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/notes/${userid}`);
        const fetchedCards = response.data.map((note: any) => ({
          cardId: note.noteid,
          title: note.title,
          content: note.content,
          cardColor: note.color,
          date: note.date,
          userid: note.userid,
          isEditing: false
        }));
        setCards(fetchedCards);
        console.log(fetchedCards);
      } catch (error) {
        console.error('There was an error fetching the notes:', error);
      }
    };

    if (userid !== null) {
      fetchNotes();
    }
  }, [userid]);

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
    });
    // Add logout logic here, e.g., clearing user session
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_WEB}/api/removeCookie`);
      } catch (error) {
        console.error('There was an error fetching the notes:', error);
      }
    };
    fetchData().then(() => {
      router.push('/'); // ใช้ router navigation ที่ถูกต้อง
    });
  }

  const filteredCards = cards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Log Out
      </button>

      <h1 className="text-3xl font-bold mb-8 mt-12">Super Note</h1>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 p-2 border border-gray-300 rounded-lg w-2/3"
        placeholder="Search cards by title or content"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full px-4">

        {filteredCards.length > 0 ? (

          filteredCards.map((card, index) => (
            <Card
              key={index}
              cardId={card.cardId}
              title={card.title}
              content={card.content}
              cardColor={card.cardColor}
              date={card.date}
              userid={userid}
            />
          ))
        ) : (
          <></>
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
                  <button onClick={handleSaveCard} className="bg-green-400 px-3 py-2 rounded-3xl">Create</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

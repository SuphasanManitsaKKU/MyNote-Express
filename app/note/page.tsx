'use client';


import { useState, useRef, useEffect } from 'react';
import Card from "./components/card";
import Image from "next/image";
import Swal from 'sweetalert2';
import React from 'react';

export default function Home() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cardColor, setCardColor] = useState('bg-white');
  const [selectedColor, setSelectedColor] = useState('bg-white');
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [cards, setCards] = useState<{ title: string; content: string; cardColor: string; isEditing: boolean }[]>([
    { title: "Reset Your Password", content: "Enter your registered email to receive a reset link.", cardColor: "bg-[#FFCDD2]", isEditing: false },
    { title: "Change Your Password", content: "Provide your email to update your password.", cardColor: "bg-[#BBDEFB]", isEditing: false },
    { title: "Recover Password", content: "Submit your email to recover your account access.", cardColor: "bg-white", isEditing: false },
    { title: "Update Password", content: "Enter your email address to reset your password.", cardColor: "bg-[#C8E6C9]", isEditing: false },
    { title: "Password Assistance", content: "Please provide your email for password assistance.", cardColor: "bg-[#F0F4C3]", isEditing: false },
    { title: "Forgotten Password", content: "Type your email to recover your password.", cardColor: "bg-[#FFECB3]", isEditing: false },
    { title: "Password Reset", content: "Enter your email to request a password reset link.", cardColor: "bg-[#D1C4E9]", isEditing: false },
    { title: "Account Recovery", content: "Submit your email to recover your account credentials.", cardColor: "bg-[#FFCCBC]", isEditing: false },
    { title: "Lost Password", content: "Please enter your email to receive password recovery instructions.", cardColor: "bg-[#DCEDC8]", isEditing: false },
    { title: "Restore Access", content: "Provide your email address to restore access to your account.", cardColor: "bg-[#F8BBD0]", isEditing: false }

  ]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
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

  function handleSaveCard() {
    if (title.trim() === "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please enter a title for the card!',
      });
      return;
    }

    setCards([
      ...cards,
      { title: title.trim(), content, cardColor, isEditing: false }
    ]);
    setTitle("");
    setContent("");
    setCardColor('bg-white');
    setIsPopupOpen(false);
  }

  useEffect(() => {
    if (isPopupOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isPopupOpen]);

  // Handle logout function
  function handleLogout() {
    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have successfully logged out!',
    });
    // Add logout logic here, e.g., clearing user session
  }

  // Filter cards based on search term
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

      <h1 className="text-3xl font-bold mb-8 mt-12">Forgot Password</h1>

      {/* Search Bar */}
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
              title={card.title}
              content={card.content}
              cardColor={card.cardColor}
            />
          ))
        ) : (
          <p>No cards found</p>
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

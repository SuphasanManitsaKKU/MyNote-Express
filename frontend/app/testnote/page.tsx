'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Card from "../note/components/card";
import Image from "next/image";
import Swal from 'sweetalert2';
import axios from 'axios';
import { useRouter } from "next/navigation";
import debounce from 'lodash.debounce';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faBell, faBellSlash } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../note/components/LoadingSpinner';
import { faCircle as faCircleSolid } from '@fortawesome/free-solid-svg-icons'; // Solid circle
import { faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID; // Replace with your actual client ID
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar';

// Define the type for the token response
interface TokenResponse {
  access_token: string;
  error?: string;
}

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cardColor, setCardColor] = useState('bg-white');
  const [date, setDate] = useState('2020-08-03');

  const [status, setStatus] = useState(false); // สร้าง state สำหรับเก็บค่า
  const [notificationTimeStatus, setNotificationTimeStatus] = useState(false); // สร้าง state สำหรับเก็บค่า
  const [notificationTime, setNotificationTime] = useState(
    new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16) // แปลงเป็นรูปแบบที่ใช้ได้กับ input type datetime-local
  );
  const [selectedColor, setSelectedColor] = useState('bg-white');
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);  // ระบุชนิดของ ref ที่นี่
  const [cards, setCards] = useState<{ cardId: string; title: string; content: string; cardColor: string; date: string; status: boolean; notificationTimeStatus: boolean; notificationTime: Date; userId: string; isEditing: boolean }[]>([]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // สร้าง state แยกเพื่อใช้กับ debounce
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [addToGoogleCalendar, setAddToGoogleCalendar] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [gapiInited, setGapiInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [endTime, setEndTime] = useState(
    new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16) // Default to 1 hour after the notificationTime
  );

  useEffect(() => {
    const loadGapi = () => {
      if (window.gapi) {
        window.gapi.load('client', initializeGapiClient);
      }
    };

    const initializeGapiClient = async () => {
      if (window.gapi) {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
          window.gapi.client.setToken({ access_token: storedToken });
          setIsAuthorized(true);
        }
        setGapiInited(true);
      }
    };

    const loadGis = () => {
      if (window.google) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response: TokenResponse) => {  // Typed response parameter
            if (response.error) {
              console.error(response.error);
            } else {
              localStorage.setItem('access_token', response.access_token);
              setIsAuthorized(true);
            }
          },
        });
        setTokenClient(client);
        setGisInited(true);
      }
    };

    const loadScripts = () => {
      // Load gapi script
      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.async = true;
      gapiScript.defer = true;
      gapiScript.onload = loadGapi;
      document.body.appendChild(gapiScript);

      // Load GIS script
      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.async = true;
      gisScript.defer = true;
      gisScript.onload = loadGis;
      document.body.appendChild(gisScript);
    };

    loadScripts();
  }, []);

  const handleAuthClick = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  };

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
    setCardColor('bg-white');
    setStatus(false);
    setNotificationTimeStatus(false);
    setNotificationTime(new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16)); // รีเซ็ต notificationTime เป็นค่าเริ่มต้น
    setIsPopupOpen(false);
  }

  async function handleSaveCard() {
    let selectedDateTime = new Date(notificationTime);

    if (notificationTimeStatus && notificationTime) {
      const currentDateTime = new Date();

      // ถ้าผู้ใช้เลือกวันเวลาในอดีต
      if (selectedDateTime < currentDateTime) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Notification time cannot be in the past. Please choose a future time.',
          confirmButtonColor: '#38bdf8',
          customClass: {
            confirmButton: 'text-white',
          },
        });
        return; // หยุดการทำงานถ้าพบว่าเป็นเวลาในอดีต
      }
    }

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

    // Step 1: Save the card
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/notes`, {
        title: title,
        content: content,
        color: cardColor,
        status: status,
        notificationTimeStatus: notificationTimeStatus,
        notificationTime: selectedDateTime.toISOString(), // ส่งเป็น ISO string ไปยัง backend
        userId: userId
      }, {
        withCredentials: true
      });

      const newId = await response.data.noteId;

      // Update the state with the new card
      setCards([
        {
          cardId: newId,
          title: title.trim(),
          content: content,
          cardColor: cardColor,
          date: new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Bangkok',
          }).format(new Date()),
          status: status,
          notificationTimeStatus: notificationTimeStatus,
          notificationTime: new Date(notificationTime), // แปลงเป็น Date object ก่อนเก็บ
          userId: userId,
          isEditing: false
        },
        ...cards
      ]);
    } catch (error) {
      console.error('There was an error saving the note:', error);
    }

    // Step 2: If "Add to Google Calendar" is checked and authorized, create the Google Calendar event
    if (addToGoogleCalendar && isAuthorized) {
      try {
        const selectedEndTime = new Date(endTime); // Use the selected end time

        const eventData = {
          summary: title,
          description: content,
          start: {
            dateTime: new Date(notificationTime).toISOString(),
            timeZone: 'Asia/Bangkok',
          },
          end: {
            dateTime: selectedEndTime.toISOString(), // Use the selected end time
            timeZone: 'Asia/Bangkok',
          },
          attendees: [],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },  // Email reminder 24 hours before
              { method: 'popup', minutes: 10 },       // Popup reminder 10 minutes before
            ],
          },
        };

        const request = await window.gapi.client.calendar.events.insert({
          calendarId: 'primary',
          resource: eventData,
        });
        const response = await request;

        Swal.fire({
          icon: 'success',
          title: 'Google Calendar Event Created!',
          text: `Event created: ${response.result.htmlLink}`,
          confirmButtonColor: '#38bdf8',
          customClass: {
            confirmButton: 'text-white',
          },
        });
      } catch (error) {
        console.error('Google Calendar API Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'There was an error creating the Google Calendar event.',
          confirmButtonColor: '#38bdf8',
          customClass: {
            confirmButton: 'text-white',
          },
        });
      }
    }

    // Step 3: Reset form fields
    setTitle("");
    setContent("");
    setCardColor('bg-white');
    setStatus(false);
    setNotificationTimeStatus(false);
    setNotificationTime(new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16));
    setIsPopupOpen(false);
  }


  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_WEB}/API/getCookie`);
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
        const fetchedCards = response.data
          // .filter((note: any) => note.status === true)  // กรอง status เป็น false
          .map((note: any) => ({
            cardId: note.noteId,
            title: note.title,
            content: note.content,
            cardColor: note.color,
            date: note.date,
            status: note.status,
            notificationTimeStatus: note.notificationTimeStatus,
            notificationTime: note.notificationTime,
            userId: note.userId,
            isEditing: false
          }));

        setCards(fetchedCards);
      } catch (error) {
        console.error('There was an error fetching the notes:', error);
        handleLogout();

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
    const revokeGoogleToken = () => {
      if (isAuthorized && window.gapi && window.gapi.client) {
        const token = window.gapi.client.getToken();
        if (token) {
          window.google.accounts.oauth2.revoke(token.access_token, () => {
            console.log('Google Token revoked.');
          });
          window.gapi.client.setToken('');
          localStorage.removeItem('access_token');
          setIsAuthorized(false);
        }
      }
    };

    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have successfully logged out!',
      confirmButtonColor: '#38bdf8',
      customClass: {
        confirmButton: 'text-white',
      }
    }).then(() => {
      // Step 1: Revoke Google Token if authorized
      revokeGoogleToken();

      // Step 2: Remove session cookie and log out from the application
      const fetchData = async () => {
        try {
          await axios.get(`${process.env.NEXT_PUBLIC_WEB}/API/removeCookie`);
          router.push('/');
        } catch (error) {
          console.error('There was an error logging out:', error);
        }
      };
      fetchData();
    });
  }


  function handleDeleteCard(id: string) {

    // ใช้ prevState ในการอัพเดต state เพื่อแน่ใจว่า state ที่อัพเดตเป็นตัวล่าสุด
    setCards(prevCards => prevCards.filter(card => card.cardId !== id));

  }
  useEffect(() => {
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
    status: boolean;
    cardId: string; title: string; content: string; cardColor: string; date: string; userId: string; isEditing: boolean
  }
  const handleUpdateCard = (updatedCard: CardProps) => {
    setCards(prevCards => {
      // ถ้า status เป็น false ให้กรองการ์ดนั้นออก
      // if (updatedCard.status === true) {
      //   return prevCards.filter(card => card.cardId !== updatedCard.cardId);
      // }

      // ถ้า status เป็น true ให้ทำการอัปเดตการ์ด
      return prevCards.map(card =>
        card.cardId === updatedCard.cardId
          ? { ...card, ...updatedCard }
          : card
      );
    });
  };

  useEffect(() => {
    if (!notificationTimeStatus) {
      setAddToGoogleCalendar(false); // ถ้า notificationTimeStatus เป็น false ให้ปิดการเลือก addToGoogleCalendar ด้วย
    }
  }, [notificationTimeStatus]); // ติดตามการเปลี่ยนแปลงของ notificationTimeStatus

  useEffect(() => {
    if (addToGoogleCalendar) {
      // Set endTime to the current time + 7 hours whenever "Add to Google Calendar" is checked
      const currentTime = new Date();
      const updatedTime = new Date(currentTime.getTime() + 7 * 60 * 60 * 1000); // Add 7 hours
      setEndTime(updatedTime.toISOString().slice(0, 16)); // Reset to the updated time
    }
  }, [addToGoogleCalendar]);


  return (
    !userId ? (
      <LoadingSpinner />
    ) : (
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

        <div className="flex justify-center items-center w-full px-8">
          <Link
            href="/note/all"
            className="flex-1 px-4 py-2 text-center transition duration-300 border-b-2 text-sky-400 border-sky-400"
          >
            <FontAwesomeIcon icon={faCircleSolid} className='pe-1' />
            All
          </Link>

          <Link
            href="/note"
            className="flex-1 px-4 py-2 text-center transition duration-300  text-black hover:text-gray-500"
          >
            <FontAwesomeIcon icon={faCircleRegular} className='pe-1' />
            Uncompleted
          </Link>

          <Link
            href="/note/archive"
            className="flex-1 px-4 py-2 text-center  transition duration-300 text-black hover:text-gray-500"
          >
            <FontAwesomeIcon icon={faCircleCheck} className='pe-1' />
            Completed
          </Link>
        </div>

        <div className="px-8 mb-2 w-full">
          <hr className="border border-gray-300" />
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

                status={card.status}
                notificationTimeStatus={card.notificationTimeStatus}
                notificationTime={card.notificationTime}

                userId={card.userId}
                onDelete={handleDeleteCard}
                onUpdate={handleUpdateCard}
              />
            ))
          ) : (
            <p></p>
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
                  {/* Checkbox สำหรับเลือกเปิด/ปิด Notification Time */}
                  <div className='flex justify-between items-center min-h-12'>
                    <div className='flex justify-center items-center gap-2 relative'>
                      <input
                        type="checkbox"
                        id="notificationTimeStatus"
                        className="hidden"
                        checked={notificationTimeStatus}
                        onChange={() => setNotificationTimeStatus(!notificationTimeStatus)}
                      />
                      <label
                        htmlFor="notificationTimeStatus"
                        className={`block w-12 h-7 rounded-full cursor-pointer transition-all duration-300 ${notificationTimeStatus ? 'bg-red-600' : 'bg-gray-300'}`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ${notificationTimeStatus ? 'translate-x-5' : ''}`}
                        >
                          {notificationTimeStatus ? (
                            <FontAwesomeIcon
                              icon={faBell}
                              className="absolute w-[14px] h-[14px] text-gray-500 top-1 right-1"
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faBellSlash}
                              className="absolute w-[14px] h-[14px] text-gray-500 top-1 left-1"
                            />
                          )}
                        </div>
                      </label>

                      <label htmlFor="notificationTimeStatus" className="text-sm text-gray-600">
                        Enable Notification Time
                      </label>
                    </div>
                    {notificationTimeStatus && (
                      <div className='flex justify-center items-center gap-2'>
                        <label htmlFor="startTime" className="text-sm text-gray-600">Start Time : </label>
                        <input
                          type="datetime-local"
                          id="notificationTime"
                          value={notificationTime}
                          min={new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                          // value={new Date(new Date(notificationTime).getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16)} // เพิ่ม 7 ชั่วโมง
                          // min={new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16)} // กำหนด min เป็นเวลาปัจจุบัน +7 ชั่วโมง
                          onChange={(e) => {
                            setNotificationTime(e.target.value)
                          }} // เก็บค่าที่ผู้ใช้เลือกใน state
                          className="p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  {notificationTimeStatus && (
                    <div className='flex justify-between items-center min-h-12 mt-2'>
                      <div className='flex justify-center items-center gap-2'>
                        {/* Custom switch for "Add to Google Calendar" */}
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="addToGoogleCalendar"
                            className="sr-only"
                            checked={addToGoogleCalendar}
                            onChange={() => setAddToGoogleCalendar(!addToGoogleCalendar)}
                          />
                          <label
                            htmlFor="addToGoogleCalendar"
                            className={`block w-12 h-7 rounded-full cursor-pointer transition-all duration-300 ${addToGoogleCalendar ? 'bg-sky-400' : 'bg-gray-300'}`}
                          >
                            <div
                              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ${addToGoogleCalendar ? 'translate-x-5' : ''}`}
                            />
                          </label>
                        </div>
                        <label htmlFor="addToGoogleCalendar" className="text-sm text-gray-600">
                          Add to Google Calendar Event
                        </label>
                      </div>
                      {addToGoogleCalendar && (
                        <div>
                          {!isAuthorized ? (
                            <button onClick={handleAuthClick} className="bg-sky-400 text-white px-3 py-2 rounded-lg hover:bg-sky-500">
                              Sign in to Google
                            </button>
                          ) : (
                            <div>
                              <label htmlFor="endTime" className="text-sm text-gray-600">End Time : </label>
                              <input
                                type="datetime-local"
                                id="endTime"
                                value={endTime}
                                min={notificationTime} // Ensure the end time is not before the notification time
                                onChange={(e) => setEndTime(e.target.value)}
                                className="p-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}


                  {/* Title Input */}
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border-none bg-transparent outline-none mb-4"
                    placeholder="Title"
                  />
                  <hr />

                  {/* Content Textarea */}
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-full border-none bg-transparent outline-none resize-none"
                    placeholder="Content"
                  />
                </div>

                <div className='flex justify-between items-center mt-4'>
                  {/* Color Picker */}
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

                  {/* Create and Cancel Buttons */}
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
    )
  );
}

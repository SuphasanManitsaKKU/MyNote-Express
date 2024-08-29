'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Card({ cardId: initialCardId, title: initialTitle, content: initialContent, cardColor: initialCardColor, date: initialDate, userid: initialUserid }: { cardId: number, title: string, content: string, cardColor: string, date: string, userid: number }) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [cardColor, setCardColor] = useState(initialCardColor);
    const [date, setDate] = useState(initialDate);
    const [userid, set๊serid] = useState(initialUserid);
    const [selectedColor, setSelectedColor] = useState(initialCardColor);

    const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

    async function daleteNote() {
        try {
            const response = await axios.delete(`${process.env.NEXT_PUBLIC_API}/api/notes/${initialCardId}`);
            console.log('Note deleted successfully:', response.data);
            window.location.reload(); // รีเฟรชหน้าเว็บ
        } catch (error) {
            console.error('There was an error deleting the note:', error);
        }
    }

    async function update() {
        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API}/api/notes/${initialCardId}`, {
                title: title,
                content: content,
                color: selectedColor,
            });
            console.log('Note updated successfully:', response.data);
        } catch (error) {
            console.error('There was an error updating the note:', error);
        }
    }

    function handleDelete(event: React.MouseEvent) {
        event.stopPropagation();
        Swal.fire({
            title: "Do you want to delete this note?",
            showDenyButton: true,
            showCancelButton: true,
            showConfirmButton: false,
            denyButtonText: `Delete`,
            cancelButtonText: `Cancel`
        }).then((result) => {
            if (result.isDenied) {
                Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    showConfirmButton: true,
                    timer: 1500
                }).then(() => {
                    daleteNote(); // เรียกใช้ฟังก์ชันลบ
                });
            }
        });
    }

    function handleEditMode() {
        setIsEditing(true);
    }

    function handleCancel() {
        setIsEditing(false);
        update(); // อัปเดตข้อมูลเมื่อออกจากโหมดแก้ไข
    }

    function handleClickOutside(event: React.MouseEvent) {
        if (event.target instanceof HTMLElement) {
            const target = event.target as HTMLElement;
            if (!target.closest('.card-content') && !target.closest('.delete-btn')) {
                handleCancel();
            }
        }
    }

    async function handleColorChange(color: string) {
        setCardColor(color);
        setSelectedColor(color);
    }

    useEffect(() => {
        if (isEditing && contentTextareaRef.current) {
            const textarea = contentTextareaRef.current;
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
    }, [isEditing]);

    return (
        <div>
            {isEditing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleClickOutside} />
            )}
            <div
                className={`border border-gray-300 rounded-lg shadow-md p-6 m-4 ${cardColor} card-content ${isEditing ? 'fixed inset-1/4 w-1/2 h-1/2 z-50 transform scale-105' : 'min-h-full relative'}`}
                onClick={handleEditMode}
            >
                {!isEditing ? (
                    <>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 overflow-hidden text-ellipsis whitespace-nowrap">{title}</h2>
                        <hr className="mb-4 border-black" />
                        <p className="text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">{content}</p>
                        <div className='delete-btn absolute bottom-4 right-4'>
                            <Image
                                width={25}
                                height={25}
                                src="/deletetrash.png"
                                alt="Delete Trash"
                                onClick={handleDelete}
                            />
                        </div>
                    </>
                ) : (
                    <div className='flex flex-col h-full'>
                        <div className='flex-grow'>
                            <div className='grid grid-cols-[3fr_1fr] gap-4 items-center'>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border-none bg-transparent outline-none mb-4"
                                    placeholder="Title"
                                />
                                <p className='text-gray-400 text-xs text-right'>{date}</p>
                            </div>
                            <hr className="mb-4 border-black" />
                            <textarea
                                ref={contentTextareaRef}
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
                            <div className='flex justify-center items-center'>
                                <Image
                                    width={25}
                                    height={25}
                                    src="/deletetrash.png"
                                    alt="Delete Trash"
                                    onClick={handleDelete}
                                    className='delete-btn'
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

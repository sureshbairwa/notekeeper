import React, { useState, useEffect } from "react";
import { db } from "./firebase"; 
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import { PlusCircle, Pin, PinOff, Edit2, Trash2, X } from "lucide-react";
import { useCallback } from "react";
import './App.css'; 



const App = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [body, setBody] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [modalTagInput, setModalTagInput] = useState("");
  const [sortnote,setSortNote]=useState("lastedit")
  const [currentPage, setCurrentPage] = useState(1); 
  const [notesPerPage] = useState(6); 

  const handleNextPage = () => {
    if (currentPage < Math.ceil(notes.length / notesPerPage)) {
      setCurrentPage(currentPage + 1);
    } else {
      toast.success("No more pages to load");
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      toast.success("You are already on the first page");
    }
  };

  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;


 

  const notesCollectionRef = collection(db, "notes");



  const fetchNotes = useCallback(async () => {
    const data = await getDocs(notesCollectionRef);
    setNotes(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  }, [notesCollectionRef]);
  
  useEffect(() => {
    fetchNotes();
  }, [sortnote, fetchNotes]);

  const addNote = async () => {
    if (title && body) {
      await addDoc(notesCollectionRef, {
        title,
        tags,
        body,
        pinned: false,
        created: new Date(),
        updated: new Date(),
      });
      toast.success("Note added successfully");
      setTitle("");
      setTags([]);
      setBody("");
      fetchNotes();
    } else {
      toast.error("Title and body are required");
    }
  };

  const togglePin = async (id, pinned) => {
    const noteDoc = doc(db, "notes", id);
    await updateDoc(noteDoc, { pinned: !pinned, updated: new Date() });
    fetchNotes();
  };

  const openModal = (note) => {
    setCurrentNote(note);
    setModalTagInput("");
    setModalIsOpen(true);
  };



  const updateNote = async () => {
    const noteDoc = doc(db, "notes", currentNote.id);
    await updateDoc(noteDoc, {
      title: currentNote.title,
      tags: currentNote.tags,
      body: currentNote.body,
      updated: new Date(),
    });
    toast.success("Note updated successfully");
    setModalIsOpen(false);
    fetchNotes();
  };

  const deleteNote = async (id) => {
    const noteDoc = doc(db, "notes", id);
    await deleteDoc(noteDoc);
    toast.success("Note deleted successfully");
    setModalIsOpen(false);
    fetchNotes();
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && tagInput) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleModalTagInput = (e) => {
    if (e.key === 'Enter' && modalTagInput) {
      setCurrentNote({
        ...currentNote,
        tags: [...currentNote.tags, modalTagInput],
      });
      setModalTagInput(""); 
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const removeModalTag = (tagToRemove) => {
    setCurrentNote({
      ...currentNote,
      tags: currentNote.tags.filter(tag => tag !== tagToRemove),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white">Note Keeper</h1>
        </div>

        <div className="bg-black rounded-xl shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="w-full px-4 py-2 placeholder:text-white text-white  text-lg border  border-gray-200 rounded-lg focus:ring-2 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 focus:border-transparent transition-all"
                placeholder="Note Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="relative">
                <input
                  className="w-full px-4 py-2 border placeholder:text-white text-white  text-lg border-gray-200 rounded-lg bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 focus:ring-2   focus:border-transparent transition-all"
                  placeholder="Add tags (type and press Enter to add)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInput}
                />
                <div className="flex flex-wrap mt-2 space-x-2">
                  {tags.map((tag, index) => (
                   <span
                   key={index}
                   className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white font-bold hover:text-black px-3 py-1 rounded-full text-sm  flex items-center justify-between border-blue-500 border"
                 >
                 
                   <span className="flex-grow text-xl mb-1">{tag}</span>
                
                   <span
                     className="ml-2  rounded-full hover:bg-pink-300 hover:text-blue-800 transition-colors cursor-pointer flex items-center justify-center"
                     onClick={(e) => {
                       e.stopPropagation(); 
                       removeTag(tag);
                     }}
                   >
                     <span className="text-lg text-black hover:text-gray-700 "><X /></span>
                   </span>
                 </span>
                  ))}
                </div>
              </div>
            </div>
            <textarea
              className="w-full px-4 py-2  text-lg placeholder:text-white text-white  border border-gray-200 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 transition-all resize-none"
              placeholder="Write your note here"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <button
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              onClick={addNote}
            >
              <PlusCircle size={20} />
              Add Note
            </button>
          </div>
        </div>


                <div className="flex items-center justify-end gap-5 mb-4">
         
          <span className="text-xl font-semibold text-gray-700">Sort by:</span>
         

   
          <select
            className="bg-gradient-to-r from-blue-500 via-purple-600 to-purple-600  text-white text-lg text-center font-semibold px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={sortnote}
            onChange={(e) => setSortNote(e.target.value)}
          >
            <option value="origindate" className="bg-purple-500 text-black font-semibold text-lg">Origin Date</option>
            <option value="lastedit" className="bg-purple-500 text-black font-semibold text-lg">Last Edit</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes
          .sort((a, b) => {
            const pinSort = b.pinned - a.pinned;

            if (pinSort !== 0) return pinSort;

            if (sortnote === "lastedit") {
              return b.updated - a.updated;
            } else if (sortnote === "origindate") {
              return a.created - b.created;
            }

            return 0;
          })
          .slice(indexOfFirstNote, indexOfLastNote)
          .map((note) => (
            <div
              key={note.id}
              className="relative bg-black text-white rounded-xl shadow-md px-5 pt-3 pb-2 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => openModal(note)}
            >
              <div className="absolute top-4 right-4">
                <button
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(note.id, note.pinned);
                  }}
                >
                  {note.pinned ? <Pin size={25} className="pin-animation" /> : <PinOff size={25} />}
                </button>
              </div>
              <h3 className="text-xl font-bold text-center mb-2 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {note.title}
              </h3>
              <div className="overflow-hidden h-14">
                <p className="text-white line-clamp-3">{note.body}</p>
              </div>
              {note.tags && (
                <div className="mt-3 space-y-1">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white font-bold text-xl rounded-full mr-2  border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
       
       <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          className="border-2 bg-gradient-to-r from-blue-500 via-purple-600 to-purple-600  text-white text-lg text-center font-semibold px-4 py-2 rounded-lg disabled:bg-gray-400"
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          className="border-2  bg-gradient-to-r from-blue-500 via-purple-600 to-purple-600  text-white text-lg text-center font-semibold px-4 py-2 rounded-lg disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90%] md:max-w-2xl bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white rounded-xl shadow-xl px-5 py-3"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        {currentNote && (
          <div className="">

          <div className="flex items-center justify-end mb-2 ">
                      <button
                          className="   text-black hover:text-white transition-colors  "
                          onClick={() => setModalIsOpen(false)}
                        >
                          <X size={27} />
                        </button>

                      </div>

            <div className="space-y-2">
         
            <div className="flex justify-between items-center mb-4">
            
              
              <input
                className="w-full text-xl font-semibold text-white bg-black   border-2  rounded-lg p-2 focus:ring-purple-500"
                value={currentNote.title}
                onChange={(e) =>
                  setCurrentNote({ ...currentNote, title: e.target.value })
                }
              />
              
            </div>
            <div>
              <input
                className="w-full bg-black text-white placeholder:text-white px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Add tags (type and press Enter to add)"
                value={modalTagInput}
                onChange={(e) => setModalTagInput(e.target.value)}
                onKeyDown={handleModalTagInput}
              />
              <div className="flex flex-wrap mt-2 space-x-2">
                {currentNote.tags &&
                  currentNote.tags.map((tag, index) => (
                    <span
                    key={index}
                    className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm  flex items-center justify-between border-2 hover:border-teal-500"
                  >
                    
                    <span className="flex-grow text-xl mb-1">{tag}</span>
                  
                   
                    <span
                      className="ml-2  rounded-full hover:bg-pink-500 hover:text-blue-800 transition-colors cursor-pointer flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        removeModalTag(tag);
                      }}
                    >
                      <span className="text-lg text-black hover:text-gray-700 "><X /></span> {/* Simple X mark */}
                    </span>
                  </span>
                  ))}
              </div>
            </div>
            <textarea
              className="w-full px-4 py-2 bg-black text-white text-lg border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32"
              value={currentNote.body}
              onChange={(e) =>
                setCurrentNote({ ...currentNote, body: e.target.value })
              }
            />
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                onClick={() => deleteNote(currentNote.id)}
              >
                <Trash2 size={20} />
                Delete
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                onClick={updateNote}
              >
                <Edit2 size={20} />
                Update Note
              </button>
            </div>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default App;

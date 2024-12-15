import { useState, useEffect, useCallback, ReactNode } from 'react';
import apiClient from '../api/apiClient';
import { useAtom } from 'jotai';
import { listsAtom } from '../store/listStore';
import { DndContext, DragEndEvent, closestCorners, DragOverlay, useSensor, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IoTrashOutline } from "react-icons/io5";
import { MdAddCircleOutline } from "react-icons/md";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { MdOutlineEdit } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { CgDetailsMore } from "react-icons/cg";




const List = () => {
  const [lists, setLists] = useAtom(listsAtom);
  const [newListName, setNewListName] = useState('');
  const [newListStatus, setNewListStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [newItems, setNewItems] = useState<{ [key: number]: { name: string; description: string } }>({});
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [listToDelete, setListToDelete] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>('');
  const [users, setUsers] = useState<{ [key: string]: string }>({});
  const [activeCreateForm, setActiveCreateForm] = useState<string | null>(null);

  const [showCreateConfirmation, setShowCreateConfirmation] = useState(false); 
  const [showItemForm, setShowItemForm] = useState<{ [key: number]: boolean }>({});
  const [showItems, setShowItems] = useState<{ [key: number]: boolean }>({});

  const [editListId, setEditListId] = useState<{ [key: number]: boolean }>({});
  const [editListName, setEditListName] = useState<{ [key: number]: string }>({});

  const [editItemId, setEditItemId] = useState<{ [key: number]: boolean }>({});
  const [editItemListId, setEditItemListId] = useState<{ [key: number]: boolean }>({});
  const [editItemName, setEditItemName] = useState<{ [key: number]: string }>({});
  const [editItemDesc, setEditItemDesc] = useState<{ [key: number]: string }>({});
  const [showItemConfirmation, setShowItemConfirmation] = useState<{ [key: number]: boolean }>({});

  const [itemSetting, setItemSetting] = useState<{ [key: number]: boolean }>({});
  const [listSetting, setListSetting] = useState<{ [key: number]: boolean }>({});




  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const storedUserName = localStorage.getItem('userId');
  //     setUserId(storedUserName);
  //   }
  //   fetchLists();
  //   fetchUsers();
  // }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check session validity
      const token = localStorage.getItem('authToken');
      const expirationTime = localStorage.getItem('authExpirationTime');
      const currentTime = Date.now();

      if (!token || !expirationTime || currentTime >= parseInt(expirationTime)) {
        // If session has expired, don't fetch any data
        console.log('Session expired, skipping data fetch');
        return; // Skip fetching if session expired
      }

      // Session is valid, proceed with fetching
      const storedUserName = localStorage.getItem('userId');
      setUserId(storedUserName);
      
      // Fetch lists and users only if session is valid
      fetchLists();
      fetchUsers();
    }
  }, []);

  const fetchLists = async () => {
    try {
      const response = await apiClient.get('/trpc/getLists');
      const fetchedLists = response.data.result.data;
      setLists(fetchedLists);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/trpc/getUsers');
      const fetchedUsers = response.data.result.data;
      const usersMap = fetchedUsers.reduce((acc: { [key: string]: string }, user: any) => {
        acc[user.id] = user.name;
        return acc;
      }, {});
      setUsers(usersMap);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };


  const handleCreateList = async () => {
    if (!newListName) return;

    try {
      const response = await apiClient.post('/trpc/createList', {
        userId: userId,
        name: newListName,
        status: newListStatus,
      });

      setLists((prevLists) => [...prevLists, response.data]);
      setNewListName('');
      setShowCreateConfirmation(false);
      setActiveCreateForm(null)

      fetchLists();
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleShowAdd = (status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    console.log(status)
    setNewListStatus(status);
    setActiveCreateForm(status)
  }

  const cancelCreateList = () => {
    setShowCreateConfirmation(false);
    setActiveCreateForm(null)
    setNewListName('');
    setNewListStatus('TODO');
  };

  const deleteList = async (listId: number) => {
    try {
      await apiClient.post('/trpc/deleteList', { listId, userId: userId });
      setLists((prevLists) => prevLists.filter((list) => list.id !== listId));
      fetchLists();
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const updateListStatus = async (listId: number, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    try {
      await apiClient.post('/trpc/moveListStatus', {
        listId,
        userId: userId,
        status,
      });
    } catch (error) {
      console.error('Error updating list status:', error);
    }
  };

  const handleEditList = async (listId: number) => {
    console.log('yea)')
    try {
      await apiClient.post('/trpc/editList', { listId, name: editListName[listId], userId: userId });
      fetchLists();
      setEditListId((prev) => ({
        ...prev,
        [listId]: !prev[listId],
      }));
  
      setEditListName((prev) => ({
        ...prev,
        [listId]: '',
      }));

    } catch (error) {
      console.error('Error editing list:', error);
    }
  };

  const handleEditItem = async (listId: number, itemId: number) => {
    try {
      await apiClient.post('/trpc/editItem', { listId, itemId, name: editItemName[itemId], description: editItemDesc[itemId], userId: userId });
      fetchLists();

      setEditItemListId((prev) => ({
        ...prev,
        [listId]: !prev[listId],
      }));

      setEditItemId((prev) => ({
        ...prev,
        [itemId]: !prev[itemId] ,
      }));
  
      setEditItemName((prev) => ({
        ...prev,
        [itemId]: '',
      }));

      setEditItemDesc((prev) => ({
        ...prev,
        [itemId]: '',
      }));
    } catch (error) {
      console.error('Error editing item:', error);
    }
  };



  const handleAddItem = async (listId: number) => {
    const item = newItems[listId];
    if (!item || !item.name) return;

    try {
      const response = await apiClient.post('/trpc/addItem', {
        listId,
        userId: userId,
        name: item.name,
        description: item.description,
      });
      console.log('Item added:', response.data);
      setNewItems((prev) => ({ ...prev, [listId]: { name: '', description: '' } }));
      setShowItemConfirmation((prev) => ({ ...prev, [listId]: false }));
      setShowItemForm((prev) => ({ ...prev, [listId]: false }));
      fetchLists();
    } catch (error) {
      console.error('Error adding item to list:', error);
    }
  };

  const cancelAddItem = (listId: number) => {
    setShowItemForm((prev) => ({ ...prev, [listId]: false }));
    setShowItemConfirmation((prev) => ({ ...prev, [listId]: false }));
    setNewItems((prev) => ({ ...prev, [listId]: { name: '', description: '' } }));
  };

  const toggleItemForm = (listId: number) => {
    setShowItemForm((prev) => ({
      ...prev,
      [listId]: !prev[listId],
    }));
  };

  const toggleItems = (listId: number) => {
    setShowItems((prev) => ({
      ...prev,
      [listId]: !prev[listId],
    }));
  };

  const toggleEditList = (listId: number, name: string) => {
    setEditListId((prev) => ({
      ...prev,
      [listId]: !prev[listId],
    }));

    setEditListName((prev) => ({
      ...prev,
      [listId]: name,
    }));
  };

  const closeEditList = (listId: number) => {
    setEditListId((prev) => ({
      ...prev,
      [listId]: !prev[listId],
    }));

    setEditListName((prev) => ({
      ...prev,
      [listId]: '',
    }));
  };

  const toggleEditItem = (listId: number, itemId: number, name: string, desc: string) => {
    setEditItemListId((prev) => ({
      ...prev,
      [listId]: !prev[listId],
    }));

    setEditItemId((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));

    setEditItemName((prev) => ({
      ...prev,
      [itemId]: name,
    }));

    setEditItemDesc((prev) => ({
      ...prev,
      [itemId]: desc,
    }));
  };

  const toggleSettingItem = (itemId: number) => {
    setItemSetting((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const toggleSettingList = (listId: number) => {
    setListSetting((prev) => ({
      ...prev,
      [listId]: !prev[listId],
    }));
  };

  const closeEditItem = (listId: number, itemId: number,) => {
    setEditItemListId((prev) => ({
      ...prev,
      [listId]: !prev[listId],
    }));

    setEditItemId((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));

    setEditItemName((prev) => ({
      ...prev,
      [itemId]: '',
    }));

    setEditItemDesc((prev) => ({
      ...prev,
      [itemId]: '',
    }));

  }

  const deleteItem = async (itemId: number) => {
    try {
      await apiClient.post('/trpc/deleteItem', { itemId, userId: userId });
      fetchLists();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const confirmDeleteList = () => {
    if (listToDelete !== null) {
      deleteList(listToDelete);
      setShowDeleteConfirmation(false);
      setListToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setListToDelete(null);
  };

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveId(null);
    if (over) {
      const activeList = lists.find((list) => list.id === Number(active.id));
      if (activeList) {
        const threshold = 800;
        let newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE' | undefined;
        if (delta.x > threshold) {
          if (activeList.status === 'TODO') newStatus = 'DONE';
          else if (activeList.status === 'IN_PROGRESS') newStatus = 'DONE';
        } else if (delta.x > 0) {
          if (activeList.status === 'TODO') newStatus = 'IN_PROGRESS';
          else if (activeList.status === 'IN_PROGRESS') newStatus = 'DONE';
        } else if (delta.x < -threshold) {
          if (activeList.status === 'DONE') newStatus = 'TODO';
          else if (activeList.status === 'IN_PROGRESS') newStatus = 'TODO';
        } else if (delta.x < 0) {
          if (activeList.status === 'DONE') newStatus = 'IN_PROGRESS';
          else if (activeList.status === 'IN_PROGRESS') newStatus = 'TODO';
        }

        if (newStatus) {
          setLists((prevLists) => {
            const newLists = [...prevLists];
            const activeIndex = newLists.findIndex((list) => list.id === activeList.id);
            newLists[activeIndex] = { ...activeList, status: newStatus };
            return newLists;
          });

          try {
            await updateListStatus(activeList.id, newStatus);
            fetchLists();
          } catch (error) {
            console.error('Failed to update list status:', error);
          }
        }
      }
    }
  }, [lists]);

  const handleDragStart = (event: any) => {

    if (event.activatorEvent.target.id === 'delete') {
      return;
    }
    setActiveId(event.active.id);
  };

  const getInitials = (fullName: string) => {
    const names = fullName?.split(' ');
    const initials = names?.map((n) => n[0]).join('');
    return initials?.toUpperCase();
  };

  const sensors = [
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  ];

  return (
    <div className="p-8 my-10">

      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <div className="flex gap-4">
          {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
            <div key={status} 
            className={`flex-1 p-4 border rounded-lg shadow-lg ${
              status === 'TODO'
                ? 'bg-red-100'
                : status === 'IN_PROGRESS'
                ? 'bg-yellow-100'
                : 'bg-green-100'
            }`}
            >
              <h2 className="text-lg font-semibold">{status}</h2>
              <SortableContext
                id={status}
                items={lists.filter((list) => list.status === status).map((list) => list.id)}
              >
                {lists.filter((list) => list.status === status).map((list) => (
                  <SortableItem key={list.id} id={list.id}>
                    <div className={`p-4 border my-4 bg-white rounded-lg shadow-lg ${activeId === list.id ? 'opacity-50' : ''} ${list.userId === userId && 'border-blue-500 border-2'}`}>

                        <div className='mb-9 w-full'>
                        <div className='flex justify-between items-center'>
                          <div>
                          {list.userId === userId && (
                            <div>
                            <button
                             onClick={() => {
                               toggleSettingList(list.id)
                             }}
                             className=" text-sm underline"
                           >
                             <CgDetailsMore className="text-black p-1 hover:bg-gray-400 rounded-full w-8 h-8" />
                           </button>

                           {listSetting[list.id] && (
                              <div className="absolute p-2 bg-white rounded-lg shadow-lg border-2">
                                <button
                                  onClick={() => {
                                    setListSetting((prev) => ({
                                      ...prev,
                                      [list.id]: !prev[list.id],
                                    }));
                                    toggleEditList(list.id, list.name)
                                  }}
                                  className="w-full p-2 text-lg flex flex-row gap-2 text-gray-500 hover:text-gray-700 items-center"
                                >
                                  <MdOutlineEdit className=" w-6 h-6" />
                                  Edit List
                                </button>
                                <button
                                  onClick={(e) => {
                                    setItemSetting((prev) => ({
                                      ...prev,
                                      [list.id]: !prev[list.id],
                                    }));
                                    e.stopPropagation();
                                    setListToDelete(list.id);
                                    setShowDeleteConfirmation(true);
                                  }}
                                  className="w-full p-2 text-lg flex flex-row gap-2 text-red-500 hover:text-red-700 items-center mt-2"
                                >
                                  <IoTrashOutline className=" w-6 h-6" />
                                  Delete List
                                </button>
                              </div>
                            )}
                            </div>
                          )}
                          </div>
                           <div className="text-base text-gray-600 flex flex-col justify-self-end">
                              <div className="relative group">
                                <div className={`w-8 h-8  rounded-full flex items-center text-xs justify-center text-white font-bold ${list.userId === userId ? 'border-2 bg-blue-400' : 'bg-orange-400'}`}>
                                  {getInitials(users[list.userId])}
                                </div>
                                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black text-white text-sm px-4 py-2 rounded-md whitespace-nowrap">
                                  {users[list.userId]}  <b>{list.userId === userId && ' (Me)'}</b>
                                </div>
                              </div>
                              </div>
                          </div>
                         
                          {editListId[list.id] ? (
                            <div className='mt-2'>
                             <input
                              type="text"
                              value={editListName[list.id] || ''}
                              onChange={(e) =>
                                setEditListName((prev) => ({
                                  ...prev,
                                  [list.id]: e.target.value,
                                }))
                              }
                              placeholder="Item Name"
                              className="p-3 border-2 rounded-lg w-full"
                            />
                            <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleEditList(list.id)
                              }
                              className="bg-green-500 hover:bg-green-700 text-sm  text-white font-bold uppercase p-2 rounded-lg w-1/2"
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => closeEditList(list.id)}
                              className="bg-red-500 hover:bg-red-700 text-white text-sm font-bold uppercase p-2 rounded-lg w-1/2"
                            >
                              Cancel
                            </button>
                          </div>
                            </div>
                          ): (
                            <div className="font-bold text-xl max-w-xs break-words m-2">{list.name}</div>
                          )}
                      </div>

                      <div className="">

                        <div className='flex gap-4 items-center'>
                          <button
                            onClick={() => toggleItemForm(list.id)}
                            className="text-blue-500 underline "
                          >
                              <MdAddCircleOutline className="text-gray-500 hover:text-gray-700 w-8 h-8" />
                          </button>

                          <button
                              onClick={() => toggleItems(list.id)}
                              className="text-gray-500  items-center flex gap-1"
                              disabled={list.items.length < 1}
                            >
                                <HiOutlineChatBubbleLeftRight className="text-gray-500 hover:text-gray-700 w-8 h-8"/>
                                <div>
                                  {list.items?.length}
                                </div>
                            </button>


                        </div>

                     

                      {showItemForm[list.id] && (
                        <div className="mb-4 mt-2 flex flex-col gap-2">
                          <input
                            type="text"
                            value={newItems[list.id]?.name || ''}
                            onChange={(e) =>
                              setNewItems((prev) => ({
                                ...prev,
                                [list.id]: {
                                  ...prev[list.id],
                                  name: e.target.value,
                                },
                              }))
                            }
                            placeholder="Item Name"
                            className="p-2 border rounded"
                          />
                          <textarea
                            value={newItems[list.id]?.description || ''}
                            onChange={(e) =>
                              setNewItems((prev) => ({
                                ...prev,
                                [list.id]: {
                                  ...prev[list.id],
                                  description: e.target.value,
                                },
                              }))
                            }
                            placeholder="Item Description"
                            className="p-2 border rounded"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setShowItemConfirmation((prev) => ({ ...prev, [list.id]: true }))
                              }
                              className="border-green-500 border-2 text-green-500 p-2 rounded mr-2 w-1/2"
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => cancelAddItem(list.id)}
                              className="border-gray-300 border-2 text-black p-2 rounded w-1/2"
                            >
                              Cancel
                            </button>
                          </div>

                        </div>
                      )}
                       {showItemConfirmation[list.id] && (
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                          <div className="bg-white p-6 rounded shadow-lg">
                            <h2 className="text-lg font-bold">Confirm Add Item</h2>
                            <p className="mt-2">
                              Are you sure you want to add this item to <b>{list.name}</b>?
                            </p>
                            <div className="flex gap-4 mt-4">
                              <button
                                onClick={() => handleAddItem(list.id)}
                                className="bg-green-500 text-white p-2 rounded"
                              >
                                Yes, Add
                              </button>
                              <button
                                onClick={() => cancelAddItem(list.id)}
                                className="bg-gray-300 text-black p-2 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      </div>

                    <div className='mt-3'>
                    {showItems[list.id] && (
                      <div className="bg-gray-100 p-4 rounded-lg">
                        {list.items?.map((item: any) => (
                         <div key={item.id} className={`p-4 border mb-4 bg-white rounded-lg shadow-lg ${item.userId === userId && 'border-blue-500 border-2'} `}>

                          <div className='flex justify-between items-center'>

                            <div>
                              {item.userId === userId && (
                                <div>
                                <button
                                onClick={() => {
                                  toggleSettingItem(item.id)
                                }}
                                className=" text-sm underline"
                              >
                                <CgDetailsMore className="text-black p-1 hover:bg-gray-400 rounded-full w-8 h-8" />
                              </button>

                              {itemSetting[item.id] && (
                                  <div className="absolute p-2 bg-white rounded-lg shadow-lg border-2">
                                    <button
                                      onClick={() => {
                                        setItemSetting((prev) => ({
                                          ...prev,
                                          [item.id]: !prev[item.id],
                                        }));
                                        toggleEditItem(list.id, item.id, item.name, item.description)
                                      }}
                                      className="w-full p-2 text-lg flex flex-row gap-2 text-gray-500 hover:text-gray-700 items-center"
                                    >
                                      <MdOutlineEdit className=" w-6 h-6" />
                                      Edit Item
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        setItemSetting((prev) => ({
                                          ...prev,
                                          [item.id]: !prev[item.id],
                                        }));
                                        e.stopPropagation();
                                        deleteItem(item.id)
                                      }}
                                      className="w-full p-2 text-lg flex flex-row gap-2 text-red-500 hover:text-red-700 items-center mt-2"
                                    >
                                      <IoTrashOutline className=" w-6 h-6" />
                                      Delete Item
                                    </button>
                                  </div>
                                )}
                                </div>
                              )}
                          </div>
                          <div className="text-base text-gray-600 justify-center justify-self-end flex">
                          <div className="relative group">
                            <div className={`w-8 h-8  rounded-full flex items-center text-xs justify-center text-white font-bold ${list.userId === userId ? 'border-2 bg-blue-400' : 'bg-orange-400'}`}>
                              {getInitials(users[list.userId])}
                            </div>
                            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black text-white text-sm px-4 py-2 rounded-md whitespace-nowrap">
                              {users[list.userId]}  <b>{list.userId === userId && ' (Me)'}</b>
                            </div>
                          </div>
                         </div>
                          </div>


                        

                         {editItemId[item.id] ? (
                          <div className="mb-4 mt-2 flex flex-col gap-2">
                          <input
                            type="text"
                            value={editItemName[item.id] || ''}
                            onChange={(e) =>
                              setEditItemName((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            placeholder="Item Name"
                            className="p-3 border-2 rounded-lg"
                          />
                          <textarea
                            value={editItemDesc[item.id] || ''}
                            onChange={(e) =>
                              setEditItemDesc((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            placeholder="Item Description"
                            className="p-3 border-2 rounded-lg"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleEditItem(list.id, item.id)
                              }
                              className="bg-green-500 hover:bg-green-700 text-sm  text-white font-bold uppercase p-2 rounded-lg w-1/2"
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => closeEditItem(list.id, item.id)}
                              className="bg-red-500 hover:bg-red-700 text-sm text-white font-bold uppercase p-2 rounded-lg w-1/2"
                            >
                              Cancel
                            </button>
                          </div>

                        </div>
                         ):(
                          <div className='m-2'>
                          <div className="font-bold text-xl max-w-xs break-words mb-1">{item.name}</div>
                          <div className="text-lg text-gray-600 max-w-xs break-words">{item.description}</div>
                        </div>

                         )}

                         
                       
                         {/* {item.userId === userId && (
                          <div className='flex gap-3 items-center'>
                            <button
                             onClick={() => {
                               
                               toggleEditItem(list.id, item.id, item.name, item.description)
                             }}
                             className=" text-sm underline mt-4"
                           >
                             <MdOutlineEdit className="text-gray-500 hover:text-gray-700 w-6 h-6" />
                           </button>
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               deleteItem(item.id);
                             }}
                             className="text-red-500 text-sm underline mt-4"
                           >
                             <IoTrashOutline className="text-red-500 hover:text-red-700 w-6 h-6" />
                           </button>
                           </div>
                         )} */}
                       </div>
                        ))}
                      </div>

                    )}
                    </div>

                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
              <div>
                
              {activeId && (
                <div className="w-full flex justify-center items-center border-2 border-dashed border-gray-600 bg-white p-8 mb-2 rounded-lg">
                  DRAG HERE
                </div>
              )}
              {activeCreateForm !== status ? (
                  <button
                    onClick={() => handleShowAdd(status as 'TODO' | 'IN_PROGRESS' | 'DONE')}
                    className=" text-blue-500 font-bold hover:text-blue-700 p-4 mb-4 flex justify-center justify-self-center flex-row items-center gap-1"
                  >
                     <IoMdAdd className="w-6 h-6"/>
                    <h2>Add New List</h2>
                  </button>
                ) : (
                  <div className="mb-4 flex flex-col gap-3 w-full">
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="New List Name"
                      className="p-3 border-2 rounded-lg"
                    />
                    <div className='flex flex-col'>
                      <div className='flex flex-col gap-3'>

                        <div className='flex flex-row gap-2'>
                        <button
                          onClick={() => setShowCreateConfirmation(true)}
                          className="bg-green-500 hover:bg-green-700 text-sm  text-white font-bold uppercase p-2 rounded-lg w-1/2"
                        >
                          Submit
                        </button>
                        <button
                          onClick={cancelCreateList}
                          className="bg-red-500 hover:bg-red-700 text-sm  text-white font-bold uppercase p-2 rounded-lg w-1/2"
                        >
                          Cancel
                        </button>
                        </div>
                    </div>

                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="p-6 border-2 border-black border-dashed text-xl font-bold bg-blue-200 rounded-lg shadow">
              {lists.find((list) => list.id === activeId)?.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold">Are you sure you want to delete this list?</h2>
            <div className="flex gap-4 mt-4">
              <button
                onClick={confirmDeleteList}
                className="bg-red-500 text-white p-2 rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-300 text-black p-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

{showCreateConfirmation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold">Confirm List Creation</h2>
            <p className="mt-2">
              Are you sure you want to create a new list named <b>{newListName}</b> with the status{' '}
              <b>{newListStatus}</b>?
            </p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleCreateList}
                className="bg-green-500 text-white p-2 rounded"
              >
                Yes, Create
              </button>
              <button
                onClick={cancelCreateList}
                className="bg-gray-300 text-black p-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

interface SortableItemProps {
  id: string;
  children: ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

export default List;

import { PopupProps } from '@/interfaces/popup'
import React from 'react'

const DeletePopupItem = ({
    open = false,
    onSave,
    onCancel
}:PopupProps ) => {
  return (
    <div>
      {open && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 shadow-lg rounded-lg">
            <h2 className="text-lg font-bold">Confirmation</h2>
            <p className="mt-2">
              Are you sure you want to delete?
            </p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={onSave}
                className="bg-green-500 hover:bg-green-700 text-sm  text-white font-bold uppercase p-2 rounded-lg"
              >
                Yes
              </button>
              <button
                onClick={onCancel}
                className="bg-white hover:bg-gray-100 text-gray-500 text-sm font-bold border-gray-400 border-2 shadow-lg uppercase p-2 rounded-lg "
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeletePopupItem

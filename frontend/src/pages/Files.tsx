import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCurrentFile, storeFiles, removeFile } from '@/redux/slices/fileSlice';
import { Card, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RootState } from '@/redux/store';
import axios from 'axios';
import { UserFile } from '@/types';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { renderValue } from '@/lib/renderValue';

const Files: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduxFiles = useSelector((state: RootState) => state.files.files);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<UserFile | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get<UserFile[]>(`${import.meta.env.VITE_BACKEND_URL}/api/file`);
        if (response?.data) {
          dispatch(storeFiles(response.data));
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, [dispatch]);

  const handleFileClick = (file: UserFile | null) => {
    if (!file) return;
    dispatch(setCurrentFile(file));
    navigate(`/file/${file._id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, file: UserFile | null) => {
    e.stopPropagation();
    if (!file) return;
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (fileToDelete?._id) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/file/delete-file/${fileToDelete._id}`);
        dispatch(removeFile(fileToDelete._id));
        setIsDeleteDialogOpen(false);
        setFileToDelete(null);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Files</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(reduxFiles) && reduxFiles.length > 0 ? (
          reduxFiles.map((file) => (
            file && (
              <Card 
                key={file._id} 
                onClick={() => handleFileClick(file)}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardTitle className="p-4">{renderValue(file?.name ?? 'Unnamed File', 20)}</CardTitle>
                <CardDescription className="px-4 pb-2">
                  {file?.bills?.length ?? 0} Bills
                </CardDescription>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Uploaded on: {file?.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => handleDeleteClick(e, file)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            )
          ))
        ) : (
          <p className="text-center text-gray-500">No files found.</p>
        )}
      </div>

      {isDeleteDialogOpen && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this file?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the file
                and all its associated bills.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Files;

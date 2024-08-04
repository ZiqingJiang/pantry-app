"use client"

import {Box, Stack, Typography, Button, Modal, TextField} from '@mui/material'
import { firestore } from './firebase';
import { doc, getDoc, setDoc, updateDoc, runTransaction, query, getDocs, deleteDoc} from "firebase/firestore";
import {collection} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { formatRevalidate } from 'next/dist/server/lib/revalidate'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {

  const [pantry, setPantry] = useState([])
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddItem = async (item) => {
    await addItem(item);
  };
  const handleRemoveItem = async (item) => {
    await removeItem(item);
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const updatePantry = async (setPantry) => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
  
    docs.forEach((doc) => {
      pantryList.push({ id: doc.id, count: doc.data().count });
    });
    console.log(pantryList);
    setPantry(pantryList);
  };

  useEffect(() => {
    updatePantry(setPantry);
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
  
    try {
      await runTransaction(firestore, async (transaction) => {
        const docSnap = await transaction.get(docRef);
        let newCount;
  
        if (docSnap.exists()) {
          newCount = (docSnap.data().count || 0) + 1;
          transaction.update(docRef, { count: newCount });
        } else {
          newCount = 1;
          transaction.set(docRef, { count: newCount });
        }
  
        console.log(`Item added. New count: ${newCount}`);
      });
  
      await updatePantry();
    } catch (e) {
      console.error("Transaction failed: ", e);
    }
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
  
    try {
      await runTransaction(firestore, async (transaction) => {
        const docSnap = await transaction.get(docRef);
        let newCount;
  
        if (docSnap.exists()) {
          const currentCount = docSnap.data().count || 0;
          newCount = currentCount > 0 ? currentCount - 1 : 0;
  
          if (newCount > 0) {
            transaction.update(docRef, { count: newCount });
          } else {
            transaction.delete(docRef);
          }
  
          console.log(`Item removed. New count: ${newCount}`);
        } else {
          console.log("Item does not exist.");
        }
      });
  
      await updatePantry();
    } catch (e) {
      console.error("Transaction failed: ", e);
    }
  };

  const filteredPantry = pantry.filter((item) =>
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'center'}
      alignItems={'center'}
      gap={2}
      >
      <div>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          width="65vw"
          height="5vh"
          marginBottom={2}
        >
            <TextField
              label="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              fullWidth
              margin="normal"
            />
        </Box>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField 
            id="outlined-basic" 
            label="Add item" 
            variant="outlined" 
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)} />
            <Button variant='contained' 
            onClick= { () => {
              handleAddItem(itemName) //itemName
              setItemName('')
              handleClose()
            }}
            >Add</Button>
          </Stack>
        </Box>
      </Modal>
        
        <Box border={'1px solid #333'}>
          
          <Box 
            // Item Title
            width="800px" 
            height="100px" 
            bgcolor={'#ADD8E6'} 
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            >
            <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
              Pantry Items
            </Typography>
          </Box>
        
        <Stack 
        // Item list
        width="800px" 
        height="300px" 
        spacing={2} 
        overflow={"auto"}

        >
    
          {pantry.map((i) => (
                <Box  
                key={i}
                width="100%"
                minHeight="80px"
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bgcolor={'#f0f0f0'}
                paddingX={5}
                >
                <Typography
                variant={'h4'}
                color={'#333'}
                textAlign={'center'}
                >
                  {
                  i.id.charAt(0).toUpperCase() + i.id.slice(1)
                  }
                </Typography>
                <Typography
                  variant={'h6'}
                  color={'#555'}
                  textAlign={'center'}
                >
                  Count: {i.count}
                </Typography>
                <Button variant='contained' onClick={() => handleRemoveItem(i.id)}>
                  Remove
                </Button>
                </Box>

              ))}
        </Stack>
        </Box>

        <Button variant="contained" onClick={handleOpen}>Add</Button>
    </Box>
  )
}

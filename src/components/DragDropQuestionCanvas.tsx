import {
  Canvas,
  FabricText,
  Group,
  Rect,
  FabricImage,
 } from 'fabric';
 import { useEffect, useRef, useState, useCallback } from 'react';
 import type { DragDropQuestion } from '../types/question';
 
 type Props = {
  question: DragDropQuestion;
  onDrop: (answers: Record<string, string>) => void;
  userAnswer?: Record<string, string>;
  feedbackVisible?: boolean;
 };
 
 type AnswerMap = Record<string, string>;
 
 export default function DragDropQuestionCanvas({
  question,
  onDrop,
  userAnswer,
  feedbackVisible,
 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<Canvas | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>(userAnswer || {});
  const answersRef = useRef(answers);
  const lastReportedAnswers = useRef<string>('');
  
  // Canvas 객체들에 대한 ref 추가
  const slotGroupsRef = useRef<Record<string, Group>>({});
  const wordGroupsRef = useRef<Record<string, Group>>({});
  const ghostGroupsRef = useRef<Record<string, Group>>({});
 
  // onDrop을 useCallback으로 최적화
  const handleDrop = useCallback((newAnswers: AnswerMap) => {
    const answersString = JSON.stringify(newAnswers);
    if (lastReportedAnswers.current !== answersString) {
      console.log('📤 Calling onDrop with:', newAnswers);
      lastReportedAnswers.current = answersString;
      onDrop(newAnswers);
    } else {
      console.log('⏭️ Skipping onDrop (same content)');
    }
  }, [onDrop]);
 
  // userAnswer 업데이트 시 중복 체크
  useEffect(() => {
    if (userAnswer && JSON.stringify(userAnswer) !== JSON.stringify(answers)) {
      console.log('🔄 userAnswer changed:', userAnswer);
      setAnswers(userAnswer);
    }
  }, [userAnswer]);
 
  // answers 변경 시 딜레이 추가하여 무한 루프 방지
  useEffect(() => {
    console.log('📝 answers state changed:', answers);
    answersRef.current = answers;
    
    const timeoutId = setTimeout(() => {
      handleDrop(answers);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [answers, handleDrop]);
 
  // userAnswer 복원을 위한 별도 useEffect
  useEffect(() => {
    if (!fabricCanvas.current || !userAnswer) return;
    
    // 현재 상태와 다를 때만 복원
    if (JSON.stringify(userAnswer) !== JSON.stringify(answers)) {
      console.log('🔄 Restoring userAnswer positions:', userAnswer);
      
      const slotGroups = slotGroupsRef.current;
      const wordGroups = wordGroupsRef.current;
      const ghostGroups = ghostGroupsRef.current;
      
      Object.entries(userAnswer).forEach(([slotLabel, word]) => {
        const slotGroup = slotGroups[slotLabel];
        const wordGroup = wordGroups[word];
        if (slotGroup && wordGroup) {
          console.log('📍 Moving', word, 'to slot', slotLabel);
          wordGroup.set({ left: slotGroup.left, top: slotGroup.top });
          wordGroup.setCoords();
          if (ghostGroups[word]) {
            ghostGroups[word].set('visible', true);
          }
        }
      });
      fabricCanvas.current.renderAll();
    }
  }, [userAnswer]);
 
  // Canvas 초기화 useEffect (userAnswer 의존성 제거)
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new Canvas(canvasRef.current, { selection: false });
    fabricCanvas.current = canvas;
 
    const SLOT_Y = 180;
    const SLOT_X_START = 120;
    const SLOT_GAP_X = 200;
    const IMAGE_Y = 90;
    const OPTION_Y = 350;
    const OPTION_X_START = 100;
    const OPTION_GAP = 140;
 
    const slotGroups: Record<string, Group> = {};
    const wordGroups: Record<string, Group> = {};
    const ghostGroups: Record<string, Group> = {};
    const initialPositions: Record<string, { left: number; top: number }> = {};
 
    question.leftLabels.forEach((label, i) => {
      const x = SLOT_X_START + i * SLOT_GAP_X;
 
      const mediaItem =
        question.media?.type === 'image-items'
          ? question.media.items.find((item) => item.label === label)
          : null;
 
      if (mediaItem) {
        FabricImage.fromURL(mediaItem.image).then((img) => {
          img.scaleToWidth(100);
          img.scaleToHeight(100);
          img.set({
            left: x,
            top: IMAGE_Y,
            originX: 'center',
            originY: 'center',
            selectable: false,
          });
          canvas.add(img);
        });
      }
 
      const rect = new Rect({
        width: 120,
        height: 40,
        fill: '#fffbe6',
        stroke: '#facc15',
        strokeWidth: 2,
        rx: 12,
        ry: 12,
        originX: 'center',
        originY: 'center',
      });
 
      const group = new Group([rect], {
        left: x,
        top: SLOT_Y,
        hasControls: false,
        hasBorders: false,
        selectable: false,
      });
 
      slotGroups[label] = group;
      canvas.add(group);
    });
 
    question.options.forEach((word, i) => {
      const left = OPTION_X_START + i * OPTION_GAP;
      const top = OPTION_Y;
 
      const text = new FabricText(word, {
        fontSize: 18,
        fill: '#374151',
        fontWeight: 'bold',
        originX: 'center',
        originY: 'center',
      });
 
      const rect = new Rect({
        width: 100,
        height: 40,
        fill: '#e0f2fe',
        rx: 10,
        ry: 10,
        originX: 'center',
        originY: 'center',
      });
 
      const group = new Group([rect, text], {
        left,
        top,
        hasControls: false,
        hasBorders: false,
        lockMovementX: false,
        lockMovementY: false,
        selectable: true,
        evented: true,
      });
 
      initialPositions[word] = { left, top };
      wordGroups[word] = group;
      canvas.add(group);
 
      const ghostRect = new Rect({
        width: 100,
        height: 40,
        fill: '#e0f2fe',
        rx: 10,
        ry: 10,
        originX: 'center',
        originY: 'center',
        opacity: 0.3,
      });
      const ghostText = new FabricText(word, {
        fontSize: 18,
        fill: '#94a3b8',
        originX: 'center',
        originY: 'center',
        opacity: 0.3,
      });
      const ghostGroup = new Group([ghostRect, ghostText], {
        left,
        top,
        hasControls: false,
        hasBorders: false,
        selectable: false,
        evented: false,
        visible: false,
      });
      ghostGroups[word] = ghostGroup;
      canvas.add(ghostGroup);
      canvas.sendObjectToBack(ghostGroup);
 
      group.on('mousedown', () => {
        if (feedbackVisible) return;
        console.log('🖱️ MouseDown on:', word);
        
        const ghost = ghostGroups[word];
        const rect = ghost.item(0) as Rect;
        rect.set({ stroke: '#3b82f6', strokeWidth: 2 });
        ghost.set('visible', true);
        canvas.requestRenderAll();
      });
 
      group.on('moving', () => {
        if (feedbackVisible) return;
        for (const slotGroup of Object.values(slotGroups)) {
          const slotRect = slotGroup.item(0) as Rect;
          const slotBox = slotGroup.getBoundingRect();
          const wordBox = group.getBoundingRect();
          const isOverlapping =
            wordBox.left < slotBox.left + slotBox.width &&
            wordBox.left + wordBox.width > slotBox.left &&
            wordBox.top < slotBox.top + slotBox.height &&
            wordBox.top + wordBox.height > slotBox.top;
          slotRect.set('fill', isOverlapping ? '#bbf7d0' : '#fffbe6');
        }
        canvas.requestRenderAll();
      });
 
      group.on('mouseup', () => {
        if (feedbackVisible) return;
        console.log('🖱️ MouseUp on:', word);
        
        let dropped = false;
 
        for (const [slotLabel, slotGroup] of Object.entries(slotGroups)) {
          const slotBox = slotGroup.getBoundingRect();
          const wordBox = group.getBoundingRect();
 
          const isOverlapping =
            wordBox.left < slotBox.left + slotBox.width &&
            wordBox.left + wordBox.width > slotBox.left &&
            wordBox.top < slotBox.top + slotBox.height &&
            wordBox.top + wordBox.height > slotBox.top;
 
          if (isOverlapping) {
            console.log('✅ Dropped', word, 'on slot', slotLabel);
            
            const existingWord = answersRef.current[slotLabel];
            const prevSlot = Object.entries(answersRef.current).find(([, w]) => w === word)?.[0];
 
            console.log('📋 Current state - existingWord:', existingWord, 'prevSlot:', prevSlot);
            console.log('📋 Current answers:', answersRef.current);
 
            if (prevSlot && prevSlot !== slotLabel) {
              console.log('🔄 Removing', word, 'from previous slot:', prevSlot);
              setAnswers((prev) => {
                const updated = { ...prev };
                delete updated[prevSlot];
                console.log('📝 After removing from prev slot:', updated);
                return updated;
              });
            }
 
            if (existingWord && existingWord !== word) {
              console.log('🔄 Moving existing word', existingWord, 'back to original position');
              const prevGroup = wordGroups[existingWord];
              const { left, top } = initialPositions[existingWord];
              prevGroup.set({ left, top });
              prevGroup.setCoords();
            }
 
            console.log('🎯 Setting', word, 'to slot', slotLabel);
            setAnswers((prev) => {
              const newAnswers = { ...prev, [slotLabel]: word };
              console.log('📝 New answers after setting:', newAnswers);
              return newAnswers;
            });
 
            group.set({ left: slotGroup.left, top: slotGroup.top });
            group.setCoords();
            ghostGroups[word].set('visible', true);
            dropped = true;
            break;
          }
        }
 
        if (!dropped) {
          console.log('❌ Not dropped, returning', word, 'to original position');
          const { left, top } = initialPositions[word];
          group.set({ left, top });
          group.setCoords();
        }
 
        for (const slotGroup of Object.values(slotGroups)) {
          const slotRect = slotGroup.item(0) as Rect;
          slotRect.set('fill', '#fffbe6');
        }
        for (const ghost of Object.values(ghostGroups)) {
          const rect = ghost.item(0) as Rect;
          rect.set({ stroke: null, strokeWidth: 0 });
        }
 
        canvas.renderAll();
      });
    });
 
    // ref에 객체들 저장
    slotGroupsRef.current = slotGroups;
    wordGroupsRef.current = wordGroups;
    ghostGroupsRef.current = ghostGroups;
 
    if (feedbackVisible) {
      console.log('🎯 Applying feedback for answers:', answers);
      Object.entries(answers).forEach(([slot, word]) => {
        const group = wordGroups[word];
        if (!group) return;
        const bg = group.item(0) as Rect;
        const isCorrect = question.correctPairs.some(
          ([l, r]) => l === slot && r === word,
        );
        console.log(`🎯 ${word} in ${slot}: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
        bg.set({ stroke: isCorrect ? 'green' : 'red', strokeWidth: 2 });
      });
      canvas.renderAll();
    }
 
    return () => {
      canvas.dispose();
    };
  }, [question, feedbackVisible]); // userAnswer 의존성 제거
 
  return (
    <div className='flex flex-col items-center gap-4'>
      <h2 className='text-2xl font-extrabold text-[#333] text-center'>
        {question.question}
      </h2>
      <canvas ref={canvasRef} width={900} height={500} />
    </div>
  );
 }
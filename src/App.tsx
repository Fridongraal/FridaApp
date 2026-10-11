import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedDatabaseIfEmpty, getUserPreferences, saveUserPreferences } from './services/db';
import { calculateSM2 } from './services/sm2';
import { calculateStreak } from './services/stats';
import type { Subject, Unit, Flashcard, ReviewRating } from './types'; 
import { Sidebar } from './components/Sidebar';
import { SubjectList } from './components/SubjectList';
import { SubjectDetail } from './components/SubjectDetail';
import { SubjectModal } from './components/SubjectModal';
import { UnitModal } from './components/UnitModal';
import { CardModal } from './components/CardModal';
import { StudySession } from './components/StudySession';
import { SessionSummary } from './components/SessionSummary';
import { TutorialModal } from './components/TutorialModal';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView'; 
import { TodayReviewView } from './components/TodayReviewView';

export function App() { 
  const [preferences, setPreferences] = useState(getUserPreferences); 
  const [activeView, setActiveView] = useState<'subjects' | 'global-study' | 'stats' | 'settings'>('subjects'); 
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null); 
  
  // Modals state 
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false); 
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null); 
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false); 
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null); 
  const [isCardModalOpen, setIsCardModalOpen] = useState(false); 
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null); 
  const [cardDefaultUnitId, setCardDefaultUnitId] = useState<string | undefined>(undefined); 
  const [isCardUnitLocked, setIsCardUnitLocked] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false); 
  
  // Study Session state 
  const [activeStudy, setActiveStudy] = useState<{ title: string; cards: Flashcard[];} | null>(null); 
  const [completedSession, setCompletedSession] = useState<{ reviewedLogs: { card: Flashcard; rating: ReviewRating}[];} | null>(null); 
  
  // Live queries from Dexie IndexedDB 
  const subjects = useLiveQuery(() => db.subjects.toArray(), []) || []; 
  const units = useLiveQuery(() => db.units.toArray(), []) || []; 
  const cards = useLiveQuery(() => db.cards.toArray(), []) || []; 
  const reviewLogs = useLiveQuery(() => db.reviewLogs.toArray(), []) || []; 
  
  // Theme synchronization with HTML document element 
  // No longer needed as we removed dark mode, but leaving empty or removing completely
  
  // Seed on startup 
  useEffect(() => { 
    seedDatabaseIfEmpty().then(() => { 
      const prefs = getUserPreferences(); 
      if (!prefs.hasSeenTutorial) { 
        setIsTutorialOpen(true); 
        saveUserPreferences({ hasSeenTutorial: true}); 
        setPreferences((p) => ({ ...p, hasSeenTutorial: true}));
      }
    });
  }, []); 
  
  const { currentStreak, reviewedTodayCount } = calculateStreak(reviewLogs); 
  const now = Date.now(); 
  
  const handleUpdatePreferences = (newPrefs: Partial<typeof preferences>) => { 
    const updated = saveUserPreferences(newPrefs); 
    setPreferences(updated);
  }; 
  
  // ------------------- CRUD: Subjects ------------------- 
  const handleSaveSubject = async (data: { name: string; description: string; color: string; icon: string}) => { 
    if (editingSubject) { 
      await db.subjects.update(editingSubject.id, data);
    } else { 
      const newSubject: Subject = { 
        id: `sub-${Date.now()}`, 
        name: data.name, 
        description: data.description, 
        color: data.color, 
        icon: data.icon, 
        createdAt: Date.now(),
      }; 
      await db.subjects.add(newSubject); 
      setSelectedSubjectId(newSubject.id);
    } 
    setEditingSubject(null);
  }; 
  
  const handleDeleteSubject = async (subjectId: string) => { 
    await db.transaction('rw', db.subjects, db.units, db.cards, async () => { 
      await db.cards.where('subjectId').equals(subjectId).delete(); 
      await db.units.where('subjectId').equals(subjectId).delete(); 
      await db.subjects.delete(subjectId);
    }); 
    if (selectedSubjectId === subjectId) { 
      setSelectedSubjectId(null);
    }
  }; 
  
  // ------------------- CRUD: Units ------------------- 
  const handleSaveUnit = async (data: { name: string; description?: string}) => { 
    if (!selectedSubjectId && !editingUnit) return; 
    const targetSubjectId = editingUnit ? editingUnit.subjectId : selectedSubjectId!; 
    if (editingUnit) { 
      await db.units.update(editingUnit.id, { name: data.name, description: data.description,});
    } else { 
      const existingInSubject = units.filter((u) => u.subjectId === targetSubjectId); 
      const newUnit: Unit = { 
        id: `unit-${Date.now()}`, 
        subjectId: targetSubjectId, 
        name: data.name, 
        description: data.description, 
        order: existingInSubject.length + 1, 
        createdAt: Date.now(),
      }; 
      await db.units.add(newUnit);
    } 
    setEditingUnit(null);
  }; 
  
  const handleDeleteUnit = async (unitId: string) => { 
    await db.transaction('rw', db.units, db.cards, async () => { 
      await db.cards.where('unitId').equals(unitId).delete(); 
      await db.units.delete(unitId);
    });
  }; 
  
  // ------------------- CRUD: Cards ------------------- 
  const handleSaveCard = async ( data: { front: string; back: string; unitId: string}, keepOpen = false ) => { 
    const parentUnit = units.find((u) => u.id === data.unitId); 
    if (!parentUnit) return; 
    if (editingCard) { 
      await db.cards.update(editingCard.id, { front: data.front, back: data.back, unitId: data.unitId, subjectId: parentUnit.subjectId,}); 
      setEditingCard(null);
    } else { 
      const newCard: Flashcard = { 
        id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, 
        subjectId: parentUnit.subjectId, 
        unitId: data.unitId, 
        front: data.front, 
        back: data.back, 
        createdAt: Date.now(), 
        interval: 1, 
        repetition: 0, 
        easeFactor: 2.5, 
        dueDate: Date.now() - 1000, 
        state: 'new',
      }; 
      await db.cards.add(newCard);
    } 
    if (!keepOpen) { 
      setIsCardModalOpen(false);
    }
  }; 
  
  const handleDeleteCard = async (cardId: string) => { 
    await db.cards.delete(cardId);
  }; 
  
  const handleImportCards = async (newCards: { front: string; back: string; unitId: string }[]) => {
    if (newCards.length === 0) return;
    const cardsToAdd: Flashcard[] = newCards.map((c) => {
      const parentUnit = units.find((u) => u.id === c.unitId);
      return {
        id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        subjectId: parentUnit?.subjectId || selectedSubjectId || "",
        unitId: c.unitId,
        front: c.front,
        back: c.back,
        createdAt: Date.now(),
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        dueDate: Date.now() - 1000,
        state: "new" as const,
      };
    });
    await db.cards.bulkAdd(cardsToAdd);
  }; 
  
  // ------------------- STUDY SESSIONS ------------------- 
  const startStudySubject = (subjectId: string) => { 
    const targetSubject = subjects.find((s) => s.id === subjectId); 
    if (!targetSubject) return; 
    const subCards = cards.filter((c) => c.subjectId === subjectId); 
    let sessionCards = subCards.filter((c) => c.dueDate <= now); 
    if (sessionCards.length === 0) { 
      sessionCards = [...subCards];
    } 
    if (sessionCards.length === 0) return; 
    setActiveStudy({ title: targetSubject.name, cards: sessionCards,});
  }; 
  
  const startStudyUnit = (unitId: string) => { 
    const targetUnit = units.find((u) => u.id === unitId); 
    if (!targetUnit) return; 
    const unitCards = cards.filter((c) => c.unitId === unitId); 
    let sessionCards = unitCards.filter((c) => c.dueDate <= now); 
    if (sessionCards.length === 0) { 
      sessionCards = [...unitCards];
    } 
    if (sessionCards.length === 0) return; 
    setActiveStudy({ title: targetUnit.name, cards: sessionCards,});
  }; 
  
  const startGlobalStudy = () => { 
    const dueCards = cards.filter((c) => c.dueDate <= Date.now()); 
    if (dueCards.length === 0) return; 
    setActiveStudy({ title: 'Repaso de Hoy', cards: dueCards });
  }; 
  
  const handleFinishStudySession = async ( reviewedLogs: { card: Flashcard; rating: ReviewRating}[] ) => { 
    await db.transaction('rw', db.cards, db.reviewLogs, async () => { 
      const updatedCardsMap = new Map<string, Flashcard>(); 

      for (const item of reviewedLogs) { 
        const currentCardState = updatedCardsMap.get(item.card.id) || item.card; 
        const sm2 = calculateSM2(currentCardState, item.rating); 
        
        const nextCardState: Flashcard = { 
          ...currentCardState, 
          interval: sm2.interval, 
          repetition: sm2.repetition, 
          easeFactor: sm2.easeFactor, 
          dueDate: sm2.dueDate, 
          state: sm2.state, 
          lastReviewed: Date.now(),
        }; 

        updatedCardsMap.set(item.card.id, nextCardState); 

        await db.reviewLogs.add({ 
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`, 
          cardId: item.card.id, 
          rating: item.rating, 
          timestamp: Date.now(), 
          interval: sm2.interval, 
          easeFactor: sm2.easeFactor,
        });
      } 

      for (const [cardId, updatedCard] of updatedCardsMap.entries()) { 
        await db.cards.update(cardId, { 
          interval: updatedCard.interval, 
          repetition: updatedCard.repetition, 
          easeFactor: updatedCard.easeFactor, 
          dueDate: updatedCard.dueDate, 
          state: updatedCard.state, 
          lastReviewed: updatedCard.lastReviewed,
        });
      }
    }); 
    setActiveStudy(null); 
    setCompletedSession({ reviewedLogs});
  }; 
  
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId); 
  const unitsInSelectedSubject = selectedSubjectId ? units.filter((u) => u.subjectId === selectedSubjectId) : []; 
  
  return ( 
    <div className={`flex h-screen overflow-hidden bg-[#F7F5FA]`}> 
      {/* Permanent Sidebar */} 
      <Sidebar 
        subjects={subjects} 
        cards={cards} 
        activeView={activeView} 
        selectedSubjectId={selectedSubjectId} 
        onSelectView={(view) => { 
          setActiveView(view); 
          setSelectedSubjectId(null);
        }} 
        onSelectSubject={(id) => { 
          setActiveView('subjects'); 
          setSelectedSubjectId(id);
        }} 
        onOpenNewSubject={() => { 
          setEditingSubject(null); 
          setIsSubjectModalOpen(true);
        }} 
        onOpenTutorial={() => setIsTutorialOpen(true)} 
        currentStreak={currentStreak} 
        reviewedTodayCount={reviewedTodayCount} 
        dailyGoal={preferences.dailyGoal} 
      /> 
      
      {/* Main Content Area */} 
      <main className="flex-1 overflow-y-auto"> 
        {activeView === 'settings' ? ( 
          <SettingsView
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onBackupRestored={() => setPreferences(getUserPreferences())}
          /> 
        ) : activeView === 'stats' ? ( 
          <StatsView subjects={subjects} cards={cards} reviewLogs={reviewLogs} currentStreak={currentStreak} reviewedTodayCount={reviewedTodayCount} preferences={preferences} onUpdatePreferences={handleUpdatePreferences} /> 
        ) : activeView === 'global-study' ? (
          <TodayReviewView
            subjects={subjects}
            cards={cards}
            onStartGlobalStudy={startGlobalStudy}
            onStartStudySubject={(subjectId) => {
              const sub = subjects.find((s) => s.id === subjectId);
              if (!sub) return;
              const subCards = cards.filter((c) => c.subjectId === subjectId);
              let sessionCards = subCards.filter((c) => c.dueDate <= Date.now());
              if (sessionCards.length === 0) {
                sessionCards = [...subCards];
              }
              if (sessionCards.length === 0) return;
              setActiveStudy({ title: sub.name, cards: sessionCards });
            }}
            onGoToSubjects={() => {
              setActiveView('subjects');
              setSelectedSubjectId(null);
            }}
          />
        ) : selectedSubject ? ( 
          <SubjectDetail 
            subject={selectedSubject} 
            units={unitsInSelectedSubject} 
            cards={cards} 
            onBack={() => setSelectedSubjectId(null)} 
            onStartStudySubject={startStudySubject} 
            onStartStudyUnit={startStudyUnit} 
            onOpenNewUnit={() => { setEditingUnit(null); setIsUnitModalOpen(true);}} 
            onEditUnit={(unit) => { setEditingUnit(unit); setIsUnitModalOpen(true);}} 
            onDeleteUnit={handleDeleteUnit} 
            onOpenNewCard={(unitId) => { 
              setEditingCard(null); 
              setCardDefaultUnitId(unitId); 
              setIsCardUnitLocked(!!unitId); 
              setIsCardModalOpen(true);
            }} 
            onEditCard={(card) => { 
              setEditingCard(card); 
              setCardDefaultUnitId(card.unitId); 
              setIsCardUnitLocked(false); 
              setIsCardModalOpen(true);
            }} 
            onDeleteCard={handleDeleteCard} 
            onImportCards={handleImportCards}
          /> 
        ) : ( 
          <SubjectList 
            subjects={subjects} 
            units={units} 
            cards={cards} 
            onSelectSubject={(id) => setSelectedSubjectId(id)} 
            onStartStudy={startStudySubject} 
            onOpenNewSubject={() => { setEditingSubject(null); setIsSubjectModalOpen(true);}} 
            onEditSubject={(sub) => { setEditingSubject(sub); setIsSubjectModalOpen(true);}} 
            onDeleteSubject={handleDeleteSubject} 
          /> 
        )} 
      </main> 
      
      {/* Active Study Session Overlay */} 
      {activeStudy && ( 
        <StudySession title={activeStudy.title} cards={activeStudy.cards} onFinishSession={handleFinishStudySession} onExit={() => setActiveStudy(null)} /> 
      )} 
      
      {/* Session Complete Celebration Summary */} 
      {completedSession && ( 
        <SessionSummary reviewedLogs={completedSession.reviewedLogs} currentStreak={currentStreak} reviewedTodayCount={reviewedTodayCount} dailyGoal={preferences.dailyGoal} onClose={() => setCompletedSession(null)} /> 
      )} 
      
      {/* Subject Modal */} 
      <SubjectModal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} onSave={handleSaveSubject} initialData={editingSubject} /> 
      {/* Unit Modal */} 
      <UnitModal isOpen={isUnitModalOpen} onClose={() => setIsUnitModalOpen(false)} onSave={handleSaveUnit} initialData={editingUnit} subjectName={selectedSubject?.name} /> 
      {/* Flashcard Modal */} 
      <CardModal 
        isOpen={isCardModalOpen} 
        onClose={() => setIsCardModalOpen(false)} 
        onSave={handleSaveCard} 
        initialData={editingCard} 
        units={selectedSubjectId ? unitsInSelectedSubject : units} 
        defaultUnitId={cardDefaultUnitId} 
        isUnitLocked={isCardUnitLocked}
      /> 
      {/* Tutorial Modal */} 
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} /> 
    </div> 
  );
} 

export default App;

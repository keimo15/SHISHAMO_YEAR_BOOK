// src/pages/MapMessages.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import JapanMap from '../assets/JapanMap'; // JSX化した日本地図をインポート

export default function JapanMapFullScreen() {
  const [selectedPref, setSelectedPref] = useState(null);
  const [memories, setMemories] = useState([]);
  console.log('Firestoreの思い出データ:', memories);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const q = query(collection(db, 'memories'), orderBy('createdAt', 'asc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMemories(data);
      } catch (err) {
        console.error('Firestore取得エラー:', err);
      }
    };
    fetchMemories();
  }, []);

  // クリックされた県名を受け取ってstate更新
  const handlePrefClick = (prefName) => {
    console.log('クリックされた県:', prefName);
    setSelectedPref(prefName);
  };

  // 選択中の県の思い出を抽出
  const filteredMemories = selectedPref
    ? memories.filter((m) => m.prefecture === selectedPref)
    : [];

  // ========================================
  // 1. 県ごとの投稿件数を集計
  // ========================================
  const prefCounts = memories.reduce((acc, mem) => {
    if (!acc[mem.prefecture]) acc[mem.prefecture] = 0;
    acc[mem.prefecture]++;
    return acc;
  }, {});

  // ========================================
  // 4. JapanMap への反映（propsとして渡す）
  // ========================================
  // selectedPref と prefCounts を渡す
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 日本地図コンポーネント */}
      <JapanMap
        selectedPref={selectedPref}
        prefCounts={prefCounts}   // 投稿件数データを渡す
        onPrefClick={handlePrefClick}
      />

      {/* 選択中の県の思い出リスト */}
      {selectedPref && (
        <div
          style={{
            position: 'absolute',
            top: '5%',
            left: '2%',
            width: '22%',
            maxHeight: '90%',
            overflowY: 'auto',
            background: '#ffaaaa',
            padding: '14px',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            zIndex: 100,
          }}
        >
          <h3 style={{ marginTop: 0, fontFamily: "'Yomogi', cursive" }}>{selectedPref}の思い出</h3>
          {filteredMemories.length === 0 ? (
            <p style={{ color: '#999', fontFamily: "'Yomogi', cursive" }}>まだ思い出はありません。</p>
          ) : (
            filteredMemories.map((mem) => (
              <div
                key={mem.id}
                style={{
                  marginBottom: '10px',
                  padding: '8px',
                  background: '#fff',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <p style={{ margin: 0 }}>{mem.message}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#555', fontFamily: "'Yomogi', cursive" }}>
                  - {mem.name || '匿名のしゃもサポ'} {mem.sns && `(${mem.sns})`}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

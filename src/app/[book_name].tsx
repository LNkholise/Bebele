import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/button';

interface VerseRow {
  Book: number;
  Chapter: number;
  Verse: number;
  Versecount: number;
}

export default function BibleReaderPage() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { book_name, book, chapter, verse } = useLocalSearchParams<{
    book_name: string;
    book: string;
    chapter: string;
    verse: string;
  }>();

  const [verses, setVerses] = useState<VerseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const currentChapter = parseInt(chapter ?? '1', 10);

  useEffect(() => {
    async function loadScripture() {
      try {
        setLoading(true);

        const bookId = parseInt(book ?? '0', 10);
        const targetChapter = parseInt(chapter ?? '0', 10);
        const targetVerse = parseInt(verse ?? '0', 10);
        
        console.log('Loading scripture with params:', { bookId, targetChapter, targetVerse });
        
        const query = `
          SELECT 
            Book AS Book, 
            Chapter AS Chapter, 
            Verse AS Verse, 
            Versecount AS Versecount 
          FROM bible 
          WHERE Book = ? 
            AND Chapter + 0 = ? 
            AND Versecount + 0 >= ?
          ORDER BY Versecount + 0 ASC
        `;

        const data = await db.getAllAsync<VerseRow>(query, [
          bookId,
          targetChapter,
          targetVerse
        ]);

        setVerses(data);
      } catch (error) {
        console.error("Failed to load verses:", error);
      } finally {
        setLoading(false);
      }
    }

    loadScripture();
  }, [book, chapter, verse]);

  const handlePrevious = () => {
    if (currentChapter > 1) {
      router.setParams({
        chapter: (currentChapter - 1).toString(),
        verse: '1' 
      });
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    }
  };

  const handleNext = () => {
    router.setParams({
      chapter: (currentChapter + 1).toString(),
      verse: '1'
    });
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.headerNumber}>{book_name}</Text>
        <Text style={styles.headerChapter}>
          {parseInt(chapter ?? '0', 10)}
        </Text>
      </View>

      <View style={styles.listWrapper}>
        <FlatList
          data={verses}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }}
          keyExtractor={(item, index) => 
            item.Chapter !== undefined && item.Versecount !== undefined 
              ? `${item.Chapter}-${item.Versecount}` 
              : index.toString()
          }
          renderItem={({ item }) => (
            <Text style={{ fontSize: 13, marginBottom: 16, color: "#1a1a1a", lineHeight: 24 }}>
              <Text style={{ fontWeight: '800', fontSize: 20, color: "#555" }}>
                {(item.Versecount ?? 0) + ". "} 
              </Text>
              {(item.Verse ?? 0)}{' '}
            </Text>
          )}
        />

        {/* Top Fade Overlay */}
        <View style={styles.topFade} pointerEvents="none">
          <View style={[styles.gradientSegment, { height: 30, opacity: 1.0 }]} />
          <View style={[styles.gradientSegment, { height: 25, opacity: 0.7 }]} />
          <View style={[styles.gradientSegment, { height: 20, opacity: 0.4 }]} />
          <View style={[styles.gradientSegment, { height: 15, opacity: 0.15 }]} />
        </View>

        {/* Bottom Fade Overlay */}
        <View style={styles.bottomFade} pointerEvents="none">
          <View style={[styles.gradientSegment, { height: 15, opacity: 0.15 }]} />
          <View style={[styles.gradientSegment, { height: 20, opacity: 0.4 }]} />
          <View style={[styles.gradientSegment, { height: 25, opacity: 0.7 }]} />
          <View style={[styles.gradientSegment, { height: 30, opacity: 1.0 }]} />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={{ flexDirection: 'row', paddingBottom: 20, width: '100%', justifyContent: 'space-between' }}>
          <Button variant="primary" icon={<Feather name="arrow-left" size={20}/>} label="" onPress={() => handlePrevious()} />
          <Button variant="primary" icon={<Feather name="arrow-right" size={20}/>} label="Next Chapter" onPress={() => handleNext()} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 50,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    height: 60,
  },
  headerNumber: {
    fontSize: 30,
    fontWeight: "800",
    color: "#d4d4d4",
    lineHeight: 72,
  },
  headerChapter: {
    fontSize: 44,
    fontWeight: "600",
    color: "#555555",
  },
  listWrapper: {
    flex: 1,
    marginVertical: 10,
    overflow: "hidden",
    position: "relative", 
  },
  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "column",
  },
  bottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "column",
  },
  gradientSegment: {
    backgroundColor: "#f4f4f4",
    width: "100%",
  },
  footer: {
    height: 50,
    width: "100%",
    justifyContent: "flex-end", 
    alignItems: "stretch",
  },
});
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from "react-native";
import { SlideUpPanel } from "../../components/slide-panel";
import { Button } from "../../components/ui/button";
import CustomRangeSlider from "../../components/ui/custom-slider";

const BIBLE_BOOKS: string[] = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke",
  "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", 
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", 
  "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", 
  "Jude", "Revelation"
];

const ITEM_HEIGHT = 55; 

const MemorizedSlider = React.memo(CustomRangeSlider);

export default function Index() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [maxChapters, setMaxChapters] = useState<number>(60);
  const [maxVerses, setMaxVerses] = useState<number>(60);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [sliderVerseValue, setVerseSliderValue] = useState<number>(1);
  const [sliderChapterValue, setChapterSliderValue] = useState<number>(1);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const midPadding = containerHeight / 2 - ITEM_HEIGHT / 2;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / ITEM_HEIGHT);
    
    if (index >= 0 && index < BIBLE_BOOKS.length) {
      setActiveIndex(index);
    }
  };

  const copyVerseToClipboard = async () => {
    try {
      const book = activeIndex;
      const chapter = parseInt(sliderChapterValue.toString());
      const verse = parseInt(sliderVerseValue.toString());

      const query = 'SELECT Verse FROM bible WHERE Book = ? AND Chapter + 0 = ? AND Versecount + 0 = ? LIMIT 1';
      const row = await db.getFirstAsync<{ verse: string }>(query, [book, chapter, verse]);

      if (row?.verse) {
        await Clipboard.setStringAsync(row.verse);
        return;
      }
    } catch (error) {
      console.error("Error copying verse:", error);
    }
  };

  const handleChapterChange = useCallback((value: number) => {
  setChapterSliderValue(Math.round(value));
  }, []);

  const handleVerseChange = useCallback((value: number) => {
  setVerseSliderValue(Math.round(value));
  }, []);

  const fetchSliderLimits = useCallback(async () => {
      const [chapRow, verseRow] = await Promise.all([
        db.getFirstAsync<{ max_chap: number }>('SELECT MAX(Chapter + 0) as max_chap FROM bible WHERE Book = ?', [activeIndex]),
        db.getFirstAsync<{ max_verse: number }>('SELECT MAX(Versecount + 0) as max_verse FROM bible WHERE Book = ? AND Chapter + 0 = ?', [activeIndex, sliderChapterValue])
      ]);

      setMaxChapters(chapRow?.max_chap || 60);
      setMaxVerses(verseRow?.max_verse || 60);

      if (sliderChapterValue > maxChapters) {
        setChapterSliderValue(1);
      }
    }, [db, activeIndex, sliderChapterValue]);
  
  React.useEffect(() => {
      fetchSliderLimits();
    }, [fetchSliderLimits]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.headerNumber}>
          {activeIndex >= 39 ? "New Testament" : "Old Testament"}
        </Text>
        <Text style={styles.headerAsterisk}>*</Text>
      </View>

      <View 
        style={styles.carouselWrapper} 
        onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
      >
        <ScrollView 
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: midPadding > 0 ? midPadding : 0,
            paddingBottom: midPadding > 0 ? midPadding : 0,
          }}
        >
          {BIBLE_BOOKS.map((book, index) => {
            const isActive = index === activeIndex;
            return (
              <View key={index} style={styles.itemContainer}>
                <Text style={[styles.bookText, isActive && styles.bookTextSelected]}>
                  {book.toLowerCase()}
                </Text>
              </View>
            );
          })}
        </ScrollView>
        
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
       <View style={{ flexDirection: 'row', paddingBottom: 20, width: '100%', justifyContent: 'flex-start' }}>
        <Button variant="primary" label="Next" onPress={() => setIsPanelOpen(true)} />
       </View>
      </View>
      
      <SlideUpPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>
        <View style={styles.panelInnerContent}>
          <Text style={styles.panelTitle}>
            {BIBLE_BOOKS[activeIndex]}
          </Text>
          <Text style={styles.panelSubtitle}>
            Chapter {sliderChapterValue} • Verse {sliderVerseValue}
          </Text>
           <View style={styles.selectorContent}>
            { maxChapters > 1 && (
            <MemorizedSlider
              minValue={1}
              maxValue={maxChapters}
              initialValue={sliderChapterValue}
              step={1}
              onValueChange={handleChapterChange}
              containerWidth={320}
              thumbWidth={110}
            />)}
            <MemorizedSlider
              minValue={1}
              maxValue={maxVerses}
              initialValue={sliderVerseValue}
              step={1}
              onValueChange={handleVerseChange}
              containerWidth={320}
              thumbWidth={110}
            />
            <View style={{ flexDirection: 'row', gap: 8, width: '100%', justifyContent: 'center' }}>
              <Button variant="secondary" label="Copy Verse" onPress={copyVerseToClipboard} />
              <Button variant="primary" label="Read Bible Verse" onPress={() => router.push({pathname: "/[book_name]",params: { book_name: BIBLE_BOOKS[activeIndex], book: activeIndex, chapter: ((parseInt(sliderChapterValue.toString()) || 0)), verse: ((parseInt(sliderVerseValue.toString()) || 0)) }})} />
            </View>
           </View>
        </View>
      </SlideUpPanel>
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
    height: 90,
  },
  headerNumber: {
    fontSize: 40,
    fontWeight: "800",
    color: "#d4d4d4",
    lineHeight: 72,
  },
  headerAsterisk: {
    fontSize: 44,
    fontWeight: "600",
    color: "#555555",
  },
  carouselWrapper: {
    flex: 1,
    marginVertical: 20,
    overflow: "hidden",
    position: "relative",
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
  },
  bookText: {
    fontSize: 38,
    fontWeight: "400",
    color: "#bcbcbc",
    letterSpacing: -1,
  },
  bookTextSelected: {
    fontWeight: "700",
    color: "#1a1a1a",
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
  panelInnerContent: {
    padding: 24,
    alignItems: "center",
    marginTop: 20,
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  panelSubtitle: {
    fontSize: 12,
    color: "#555",
  },
  selectorContent: {
  width: "100%",  
  alignItems: "center",
  gap: 20,
  paddingTop: 30,
  }
});
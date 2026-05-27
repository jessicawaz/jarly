import {
  View, Text, TouchableOpacity,
  StyleSheet, Modal, KeyboardAvoidingView, Platform,
} from "react-native";
import { useState } from "react";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
import { colors, fonts } from "../../constants/colors";
import { patch } from "@jarly/api-client";

const jars = [
  { name: "Needs", desc: "Stuff you have to pay", color: colors.needs, light: colors.needsLight },
  { name: "Goals", desc: "What you're saving for", color: colors.goals, light: colors.goalsLight },
  { name: "Fun",   desc: "Yours to spend freely",  color: colors.fun,   light: colors.funLight },
];

export default function JarSplitModal({ visible, onClose, onSaved, currentNeedsPct, currentGoalsPct, currentFunPct }) {
  const [split, setSplit] = useState([
    currentNeedsPct || 50,
    currentGoalsPct || 20,
    currentFunPct  || 30,
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSliderChange = (index, newValue) => {
    const clamped = Math.min(100, Math.max(0, Math.round(newValue)));
    const delta = clamped - split[index];
    const others = [0, 1, 2].filter((i) => i !== index);
    const otherTotal = others.reduce((sum, i) => sum + split[i], 0);

    const newSplit = [...split];
    newSplit[index] = clamped;

    if (otherTotal === 0) {
      others.forEach((i) => { newSplit[i] = Math.max(0, Math.round(-delta / 2)); });
    } else {
      others.forEach((i) => {
        const proportion = split[i] / otherTotal;
        newSplit[i] = Math.max(0, Math.round(split[i] - delta * proportion));
      });
    }

    const total = newSplit.reduce((a, b) => a + b, 0);
    const diff = 100 - total;
    if (diff !== 0) {
      const largestOther = others.reduce((a, b) => newSplit[a] >= newSplit[b] ? a : b);
      newSplit[largestOther] += diff;
    }

    setSplit(newSplit);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await patch('/api/v1/users/me', {
        needsPct: split[0],
        goalsPct: split[1],
        funPct: split[2],
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.container}>
            <View style={styles.handle} />
            <Text style={styles.title}>Jar split</Text>
            <Text style={styles.subtitle}>They always add up to 100%</Text>

            <View style={styles.jarsList}>
              {jars.map((jar, i) => (
                <View key={i} style={styles.jarRow}>
                  <View style={styles.jarInfo}>
                    <View style={[styles.jarDot, { backgroundColor: jar.light }]}>
                      <View style={[styles.jarDotInner, { backgroundColor: jar.color }]} />
                    </View>
                    <View>
                      <Text style={styles.jarName}>{jar.name}</Text>
                      <Text style={styles.jarDesc}>{jar.desc}</Text>
                    </View>
                  </View>
                  <Text style={[styles.jarPct, { color: jar.color }]}>{split[i]}%</Text>
                </View>
              ))}
            </View>

            {jars.map((jar, i) => (
              <View key={i} style={styles.sliderRow}>
                <View style={[styles.sliderLabel, { backgroundColor: jar.light }]}>
                  <Text style={[styles.sliderLabelText, { color: jar.color }]}>{jar.name}</Text>
                </View>
                <View style={styles.sliderWrapper}>
                  <View style={styles.sliderTrack}>
                    <View style={[styles.sliderFill, { width: `${split[i]}%`, backgroundColor: jar.color }]} />
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={split[i]}
                    onValueChange={(val) => handleSliderChange(i, val)}
                    minimumTrackTintColor="transparent"
                    maximumTrackTintColor="transparent"
                    thumbTintColor={jar.color}
                  />
                </View>
              </View>
            ))}

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>
                {loading ? 'Saving...' : 'Save split'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: '#E8E0D8',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 22,
    color: colors.textDark,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.semi,
    fontSize: 13,
    color: colors.textMid,
    marginBottom: 20,
  },
  jarsList: {
    marginBottom: 20,
    gap: 12,
  },
  jarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  jarDot: {
    width: 32, height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jarDotInner: {
    width: 14, height: 14,
    borderRadius: 7,
  },
  jarName: {
    fontFamily: fonts.extra,
    fontSize: 14,
    color: colors.textDark,
  },
  jarDesc: {
    fontFamily: fonts.semi,
    fontSize: 11,
    color: colors.textMid,
  },
  jarPct: {
    fontFamily: fonts.display,
    fontSize: 18,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sliderLabel: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    width: 56,
    alignItems: 'center',
  },
  sliderLabelText: {
    fontFamily: fonts.extra,
    fontSize: 11,
  },
  sliderWrapper: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
  },
  sliderTrack: {
    position: 'absolute',
    left: 0, right: 0,
    height: 8,
    backgroundColor: '#F0EBE3',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
  },
  slider: {
    width: '100%',
    height: 30,
  },
  error: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#E05C5C',
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: colors.needs,
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.needs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontFamily: fonts.extra,
    fontSize: 16,
  },
});
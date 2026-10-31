// ReceiptsScreen.js — Capture, upload, link receipts
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, Alert, Image, ScrollView,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useApp } from '../context/AppContext';
import { Card, Button, Input, EmptyState } from '../components';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import { uploadFile } from '../services/firebase';
import moment from 'moment';

export default function ReceiptsScreen() {
  const { receipts, addReceipt, deleteReceipt, transactions } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [linkedTxId, setLinkedTxId] = useState('');
  const [merchant, setMerchant] = useState('');
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptDate, setReceiptDate] = useState(moment().format('YYYY-MM-DD'));
  const [uploading, setUploading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const pickImage = (useCamera) => {
    const options = { mediaType: 'photo', quality: 0.8 };
    const picker = useCamera ? launchCamera : launchImageLibrary;
    picker(options, (response) => {
      if (!response.didCancel && !response.error && response.assets?.[0]) {
        setSelectedImage(response.assets[0]);
        setShowModal(true);
      }
    });
  };

  const handleSave = async () => {
    if (!selectedImage) return Alert.alert('Error', 'Please select an image');
    setUploading(true);
    try {
      let imageUrl = selectedImage.uri;
      // Try to upload to Firebase Storage
      try {
        imageUrl = await uploadFile(selectedImage.uri, `receipts/${Date.now()}.jpg`);
      } catch {
        // Offline — keep local URI
      }
      await addReceipt({
        imageUrl,
        localUri: selectedImage.uri,
        merchant,
        amount: parseFloat(receiptAmount) || 0,
        date: receiptDate,
        linkedTransactionId: linkedTxId || null,
      });
      setShowModal(false);
      setSelectedImage(null);
      setMerchant(''); setReceiptAmount(''); setLinkedTxId('');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (r) => {
    Alert.alert('Delete Receipt', 'Delete this receipt?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteReceipt(r.id) },
    ]);
  };

  const renderReceipt = ({ item }) => {
    const linked = transactions.find((t) => t.id === item.linkedTransactionId);
    return (
      <TouchableOpacity onPress={() => setSelectedReceipt(item)} onLongPress={() => handleDelete(item)}>
        <Card style={styles.receiptCard}>
          <Image
            source={{ uri: item.imageUrl || item.localUri }}
            style={styles.receiptThumb}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.receiptMerchant}>{item.merchant || 'Receipt'}</Text>
            <Text style={styles.receiptDate}>{moment(item.date).format('MMM D, YYYY')}</Text>
            {item.amount > 0 && <Text style={styles.receiptAmount}>${item.amount.toFixed(2)}</Text>}
            {linked && (
              <View style={styles.linkedBadge}>
                <Text style={styles.linkedText}>🔗 {linked.description}</Text>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Receipts</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => pickImage(true)}>
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionLabel}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => pickImage(false)}>
          <Text style={styles.actionIcon}>🖼️</Text>
          <Text style={styles.actionLabel}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => { setSelectedImage({ uri: 'https://via.placeholder.com/300x400' }); setShowModal(true); }}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionLabel}>Upload</Text>
        </TouchableOpacity>
      </View>

      {receipts.length === 0 ? (
        <EmptyState icon="🧾" title="No receipts yet" subtitle="Capture or upload receipts to keep track of your spending" />
      ) : (
        <FlatList
          data={receipts}
          keyExtractor={(r) => r.id}
          renderItem={renderReceipt}
          contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Receipt Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Save Receipt</Text>
              {selectedImage && (
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} resizeMode="cover" />
              )}
              <Input label="Merchant / Store" value={merchant} onChangeText={setMerchant} placeholder="e.g. Starbucks" />
              <Input label="Amount ($)" value={receiptAmount} onChangeText={setReceiptAmount} placeholder="0.00" keyboardType="decimal-pad" />
              <Input label="Date (YYYY-MM-DD)" value={receiptDate} onChangeText={setReceiptDate} />

              <Text style={styles.fieldLabel}>Link to Transaction (optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
                {transactions.slice(0, 10).map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setLinkedTxId(t.id === linkedTxId ? '' : t.id)}
                    style={[styles.txChip, linkedTxId === t.id && styles.txChipActive]}>
                    <Text style={[styles.txChipText, linkedTxId === t.id && { color: '#fff' }]} numberOfLines={1}>
                      {t.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Button title="Save Receipt" onPress={handleSave} loading={uploading} />
              <Button title="Cancel" variant="outline" style={{ marginTop: 8 }} onPress={() => { setShowModal(false); setSelectedImage(null); }} />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Receipt Detail Modal */}
      <Modal visible={!!selectedReceipt} animationType="fade" transparent onRequestClose={() => setSelectedReceipt(null)}>
        <View style={styles.detailOverlay}>
          <View style={styles.detailCard}>
            {selectedReceipt && (
              <>
                <Image source={{ uri: selectedReceipt.imageUrl || selectedReceipt.localUri }} style={styles.detailImage} resizeMode="contain" />
                <Text style={styles.detailMerchant}>{selectedReceipt.merchant || 'Receipt'}</Text>
                <Text style={styles.detailDate}>{moment(selectedReceipt.date).format('MMMM D, YYYY')}</Text>
                {selectedReceipt.amount > 0 && <Text style={styles.detailAmount}>${selectedReceipt.amount.toFixed(2)}</Text>}
                <Button title="Close" onPress={() => setSelectedReceipt(null)} style={{ marginTop: Spacing.md }} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginHorizontal: Spacing.md, marginBottom: Spacing.md,
  },
  actionBtn: {
    flex: 1, alignItems: 'center', padding: Spacing.md,
    backgroundColor: '#fff', borderRadius: BorderRadius.lg, marginHorizontal: 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  actionIcon: { fontSize: 32, marginBottom: 6 },
  actionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  receiptCard: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, alignItems: 'center' },
  receiptThumb: { width: 72, height: 72, borderRadius: BorderRadius.md },
  receiptMerchant: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  receiptDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  receiptAmount: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
  linkedBadge: { backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.sm, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4, alignSelf: 'flex-start' },
  linkedText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, paddingBottom: 50 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  previewImage: { width: '100%', height: 180, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 },
  txChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.border, marginRight: 8, backgroundColor: '#fff', maxWidth: 150,
  },
  txChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  txChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: Spacing.md },
  detailCard: { backgroundColor: '#fff', borderRadius: BorderRadius.xl, padding: Spacing.lg, width: '100%', alignItems: 'center' },
  detailImage: { width: '100%', height: 300, borderRadius: BorderRadius.md },
  detailMerchant: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginTop: Spacing.md },
  detailDate: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  detailAmount: { fontSize: 28, fontWeight: '900', color: Colors.primary, marginTop: 8 },
});

import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

const collection = () => getDB().collection('participants');

export async function createParticipant(data) {
  try {
    const result = await collection().insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result.insertedId;
  } catch (error) {
    // 處理重複 email 錯誤
    if (error.code === 11000) {
      throw new Error('此 Email 已被使用');
    }
    throw error;
  }
}

export function listParticipants({ page = 1, limit = 10 } = {}) {
  const skip = (page - 1) * limit;
  
  return Promise.all([
    collection()
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection().countDocuments()
  ]).then(([items, total]) => ({ items, total, page, limit }));
}

export async function updateParticipant(id, patch) {
  try {
    return await collection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...patch, updatedAt: new Date() } }
    );
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('此 Email 已被使用');
    }
    throw error;
  }
}

export function deleteParticipant(id) {
  return collection().deleteOne({ _id: new ObjectId(id) });
}
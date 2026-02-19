import {
  doc, deleteDoc, collection, getDocs, query, where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function deletePost(postId: string): Promise<void> {
  // 1. 리액션 삭제
  const reactionsSnap = await getDocs(
    query(collection(db, 'reactions'), where('postId', '==', postId))
  )
  for (const reactionDoc of reactionsSnap.docs) {
    await deleteDoc(doc(db, 'reactions', reactionDoc.id))
  }

  // 2. 댓글 서브컬렉션 삭제
  const commentsSnap = await getDocs(collection(db, 'posts', postId, 'comments'))
  for (const commentDoc of commentsSnap.docs) {
    await deleteDoc(doc(db, 'posts', postId, 'comments', commentDoc.id))
  }

  // 3. 기존 좋아요 삭제 (하위호환)
  const likesSnap = await getDocs(
    query(collection(db, 'likes'), where('postId', '==', postId))
  )
  for (const likeDoc of likesSnap.docs) {
    await deleteDoc(doc(db, 'likes', likeDoc.id))
  }

  // 4. 게시글 삭제
  await deleteDoc(doc(db, 'posts', postId))
}

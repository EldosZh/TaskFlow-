from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Task
from ..schemas import TaskCreate, TaskRead, TaskStats, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/stats", response_model=TaskStats)
def get_stats(db: Session = Depends(get_db)) -> TaskStats:
    total, completed = db.execute(select(func.count(Task.id), func.sum(Task.completed))).one()
    completed_count = int(completed or 0)
    return TaskStats(total=int(total), completed=completed_count, remaining=int(total) - completed_count)


@router.get("", response_model=list[TaskRead])
def list_tasks(
    search: str | None = Query(default=None, max_length=200),
    completed: bool | None = None,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> list[Task]:
    query = select(Task)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.where(or_(Task.title.ilike(term), Task.description.ilike(term)))
    if completed is not None:
        query = query.where(Task.completed == completed)
    return list(db.scalars(query.order_by(Task.created_at.desc(), Task.id.desc()).offset(offset).limit(limit)))


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)) -> Task:
    task = Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, db: Session = Depends(get_db)) -> Task:
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)) -> Task:
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)) -> Response:
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

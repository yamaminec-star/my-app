import json
import os
from pathlib import Path

def extract_file_list(data):
    if isinstance(data, list):
        return set(data)
    elif isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, list):
                return set(value)
    return set()

def main():
    target_folders_str = os.environ.get('TARGET_FOLDERS', 'textures')
    json_filename = os.environ.get('JSON_FILENAME', 'texture-list.json')
    target_dirs = [folder.strip() for folder in target_folders_str.split(',')]
    
    print(f"JSONファイル名: {json_filename}")
    print(f"対象フォルダ: {', '.join(target_dirs)}")
    
    total_deleted = 0
    
    for target_dir in target_dirs:
        dir_path = Path(target_dir)
        print(f"\n処理中: {target_dir}")
        
        if not dir_path.exists():
            print("フォルダが存在しません")
            continue
        
        json_file = dir_path / json_filename
        if not json_file.exists():
            print(f"{json_filename} が見つかりません")
            continue
        
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                valid_files = extract_file_list(data)
            
            if not valid_files:
                print("JSONからファイルリストを抽出できませんでした")
                continue
            
            print(f"保持ファイル: {len(valid_files)}個")
        except Exception as e:
            print(f"JSON読み込みエラー: {e}")
            continue
        
        files_to_delete = []
        for file_path in dir_path.iterdir():
            if file_path.is_file() and file_path.name != json_filename:
                if file_path.name not in valid_files:
                    files_to_delete.append(file_path)
        
        if files_to_delete:
            print(f"削除: {len(files_to_delete)}個")
            for f in files_to_delete:
                print(f"  - {f.name}")
                f.unlink()
            total_deleted += len(files_to_delete)
        else:
            print("削除対象なし")
    
    print(f"\n合計 {total_deleted} 個削除")
    return total_deleted

if __name__ == '__main__':
    main()
